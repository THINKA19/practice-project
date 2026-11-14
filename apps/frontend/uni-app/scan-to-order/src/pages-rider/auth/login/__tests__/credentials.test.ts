import { expect, it } from 'vitest'
import { loginCredentials } from '../domain/login.rules'

it('登录校验修剪账号但保留密码原文，拒绝空凭证', () => {
  expect(loginCredentials(' rider ', ' secret ')).toEqual({ username: 'rider', password: ' secret ' })
  expect(() => loginCredentials(' ', 'password')).toThrow('账号和密码')
  expect(() => loginCredentials('rider', '')).toThrow('账号和密码')
})
