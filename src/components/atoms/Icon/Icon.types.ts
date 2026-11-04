import React from 'react'

export type IconName =
  | 'search'
  | 'sun'
  | 'moon'
  | 'laptop'
  | 'close'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-up'
  | 'chevron-down'
  | 'check'
  | 'alert'
  | 'info'
  | 'settings'

export type IconSize = 'sm' | 'md' | 'lg'

export interface IconProps extends Omit<React.SVGAttributes<SVGSVGElement>, 'size'> {
  name: IconName
  size?: IconSize
  label?: string
}
