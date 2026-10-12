import React from 'react'

export type SpinnerSize = 'sm' | 'md' | 'lg'

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: SpinnerSize
  label?: string
}
