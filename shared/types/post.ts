/**
 * shared/types/post.ts
 * NanoFeed — Post Type Definitions
 */

import type { PublicUser } from './user'

/** Post as stored in the database */
export interface Post {
  id: string
  content: string
  authorId: string
  createdAt: Date
  updatedAt: Date
  parentId?: string | null
  hidden: boolean
}

/** Post with author details (used in feed rendering) */
export interface PostWithAuthor extends Post {
  author: PublicUser
  hashtags: { tag: string }[]
  _count?: {
    replies: number
    reactions: number
  }
}

/** Input for creating a new post */
export interface CreatePostInput {
  content: string
  parentId?: string
}

/** Paginated feed response */
export interface PaginatedPosts {
  posts: PostWithAuthor[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
