/**
 * app/composables/usePosts.ts
 * NanoFeed — Post CRUD Composable
 *
 * Provides post creation and deletion with loading and error states.
 */

export const usePosts = () => {
  const isCreating = ref(false)
  const isDeleting = ref<string | null>(null) // tracks which post is being deleted
  const error = ref<string | null>(null)

  /**
   * Create a new post or reply.
   */
  const createPost = async (content: string, parentId?: string) => {
    isCreating.value = true
    error.value = null

    try {
      const response = await $fetch('/api/posts/create', {
        method: 'POST',
        body: { content, parentId },
      }) as { data?: unknown }

      return response?.data ?? null
    } catch (err: unknown) {
      const msg =
        (err as { data?: { error?: string } })?.data?.error ??
        'Failed to create post'
      error.value = msg
      return null
    } finally {
      isCreating.value = false
    }
  }

  /**
   * Toggle a "love" reaction on a post.
   */
  const reactToPost = async (postId: string) => {
    try {
      const response = await $fetch(`/api/posts/${postId}/react`, {
        method: 'POST'
      }) as { data: { reacted: boolean } }
      return response.data
    } catch (err: unknown) {
      console.error('Failed to react:', err)
      return null
    }
  }

  /**
   * Delete a post by ID.
   * @returns true on success, false on failure
   */
  const deletePost = async (postId: string): Promise<boolean> => {
    isDeleting.value = postId
    error.value = null

    try {
      await $fetch(`/api/posts/${postId}`, { method: 'DELETE' })
      return true
    } catch (err: unknown) {
      const msg =
        (err as { data?: { error?: string } })?.data?.error ??
        'Failed to delete post'
      error.value = msg
      return false
    } finally {
      isDeleting.value = null
    }
  }

  return {
    isCreating,
    isDeleting,
    error,
    createPost,
    deletePost,
    reactToPost,
  }
}
