import prisma from './prisma'

export type LogAction =
  | 'created' | 'updated' | 'deleted'
  | 'published' | 'unpublished'
  | 'featured' | 'unfeatured'
  | 'replied' | 'archived' | 'password_changed'
  | 'webhook_registered' | 'webhook_deleted'

export type LogEntity =
  | 'project' | 'blog_post' | 'testimonial'
  | 'faq' | 'about' | 'contact_message'
  | 'setting' | 'project_group' | 'media'
  | 'webhook'

interface LogParams {
  adminId?:    string
  adminEmail?: string
  action:      LogAction
  entity:      LogEntity
  entityId?:   string
  entityName?: string
  meta?:       Record<string, unknown>
}

/**
 * Write an activity log entry. Fire-and-forget — never throws.
 */
export async function log(params: LogParams): Promise<void> {
  try {
    await (prisma as any).activityLog.create({ data: params })
  } catch {
    // Logging should never break a request
  }
}
