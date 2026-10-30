import React from 'react'

export type IconName =
  | 'sun'
  | 'moon'
  | 'laptop'
  | 'search'
  | 'chevron-down'
  | 'check'
  | 'x'
  | 'user'
  | 'bell'
  | 'menu'
  | 'lock'
  | 'info'
  | 'plus'
  | 'fingerprint'

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName
  size?: number
}
