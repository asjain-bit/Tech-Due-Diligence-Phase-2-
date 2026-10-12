import React from 'react'

export type IconName =
  | 'search'
  | 'sun'
  | 'moon'
  | 'laptop'
  | 'close'
  | 'chevron-left'
  | 'chevron-right'
  | 'check'
  | 'alert'
  | 'info'
  | 'settings'

export type IconSize = 'sm' | 'md' | 'lg'

export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  name: IconName
  size?: IconSize
  label?: string
}
