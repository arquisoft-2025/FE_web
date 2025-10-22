import React from 'react'
import { renderToString } from 'react-dom/server'
import * as ReactRouterDOM from 'react-router-dom'
const { MemoryRouter } = ReactRouterDOM
import App from './App'

export function render(url) {
  const html = renderToString(
    <MemoryRouter initialEntries={[url]}>
      <App />
    </MemoryRouter>
  )
  return html
}

export default render
