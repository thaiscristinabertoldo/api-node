import express, { Request, Response } from 'express'
import cors from 'cors'
import * as bodyParser from 'body-parser'
import dotenv from 'dotenv'
import { connectionDatabase } from './connection'
import { Routes } from './route'
import { isLoggedIn } from './middleware'
import { UserController } from './controller'

async function bootstrap() {
  dotenv.config()
  const app = express()
  app.use(bodyParser.json())
  app.use(cors({ origin: '*' }))

  connectionDatabase()

  // register express routes from defined application routes
  const userController = new UserController()
  app.route('/auth/register').post(userController.create)
  app.route('/auth/login').post(userController.login)

  Routes.forEach((route) => {
    ;(app as any)[route.method](route.route, isLoggedIn, (req: Request, res: Response, next: Function) => {
      const result = new (route.controller as any)()[route.action](req, res, next)
      if (result instanceof Promise) {
        result.then((result) => (result !== null && result !== undefined ? res.send(result) : undefined))
      } else if (result !== null && result !== undefined) {
        res.json(result)
      }
    })
  })

  app.listen(8080)

  console.log('Express server has started on port 8080. Open http://localhost:8080 to see results')
}

bootstrap()
