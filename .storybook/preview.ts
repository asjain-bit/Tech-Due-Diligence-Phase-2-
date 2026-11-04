import type { Preview } from '@storybook/react'
import React from 'react'
import '../src/app/globals.css'
import { ThemeProvider } from '../src/contexts/ThemeContext'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story) => React.createElement(ThemeProvider, null, React.createElement(Story, null)),
  ],
}

export default preview
