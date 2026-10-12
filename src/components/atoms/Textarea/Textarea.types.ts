import React from 'react'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}
