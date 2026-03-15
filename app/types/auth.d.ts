import { Role } from '../shared/constants/roles'

declare module '@auth/core/types' {
  interface User {
    id: string
    username: string
    displayName: string
    avatar: string
    role: Role
    verified: boolean
  }

  interface Session {
    user: User
  }
}

declare module 'next-auth' {
  interface User {
    id: string
    username: string
    displayName: string
    avatar: string
    role: Role
    verified: boolean
  }

  interface Session {
    user: User
  }
}
