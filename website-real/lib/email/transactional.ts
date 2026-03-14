/**
 * Mailchimp Transactional (Mandrill) email sending service
 * 
 * This module handles sending transactional emails via Mailchimp Transactional API.
 * Requires environment variables:
 * - MAILCHIMP_TX_API_KEY: Your Mailchimp Transactional API key
 * - MAIL_FROM_EMAIL: From email address
 * - MAIL_FROM_NAME: From name
 * - MAIL_REPLY_TO: Reply-to email address
 */

import mailchimpTransactional from '@mailchimp/mailchimp_transactional'

type MergeVar = {
  name: string
  content: string
}

type SendTransactionalTemplateParams = {
  templateName: string
  toEmail: string
  toName?: string
  mergeVars: Record<string, string | number | null | undefined>
  subject?: string
  mergeLanguage?: 'mailchimp' | 'handlebars'
}

type SendResult = {
  success: boolean
  messageId?: string
  error?: string
}

let _client: ReturnType<typeof mailchimpTransactional> | null = null

function getClient(apiKey: string) {
  if (!_client) {
    _client = mailchimpTransactional(apiKey)
  }
  return _client
}

/**
 * Send a transactional email using a Mailchimp template
 */
export async function sendTransactionalTemplate(
  params: SendTransactionalTemplateParams
): Promise<SendResult> {
  const { templateName, toEmail, toName, mergeVars, subject } = params

  // Validate environment variables
  const apiKey = process.env.MAILCHIMP_TX_API_KEY
  const fromEmail = process.env.MAIL_FROM_EMAIL
  const fromName = process.env.MAIL_FROM_NAME
  const replyTo = process.env.MAIL_REPLY_TO

  if (!apiKey) {
    console.error('MAILCHIMP_TX_API_KEY is not set')
    return { success: false, error: 'Missing API key' }
  }

  if (!fromEmail) {
    console.error('MAIL_FROM_EMAIL is not set')
    return { success: false, error: 'Missing from email' }
  }

  try {
    const client = getClient(apiKey)

    // Convert merge vars object to Mailchimp format
    const globalMergeVars: MergeVar[] = Object.entries(mergeVars).map(
      ([name, content]) => ({
        name,
        content: String(content ?? ''),
      })
    )

    const replyToHeader = replyTo || fromEmail

    // Prepare message payload
    const message = {
      to: [
        {
          email: toEmail,
          name: toName || toEmail,
          type: 'to' as const,
        },
      ],
      from_email: fromEmail,
      from_name: fromName || 'NY',
      headers: replyToHeader ? { 'Reply-To': replyToHeader } : undefined,
      subject: subject,
      global_merge_vars: globalMergeVars,
      merge: true,
      merge_language: params.mergeLanguage ?? 'mailchimp',
      tags: ['transactional'],
    }

    // Send template
    const response = await client.messages.sendTemplate({
      template_name: templateName,
      template_content: [],
      message,
    })

    // Check response
    if (Array.isArray(response) && response.length > 0) {
      const result = response[0]
      
      if (result.status === 'sent' || result.status === 'queued') {
        console.log(`Email sent successfully to ${toEmail} (${result._id})`)
        return {
          success: true,
          messageId: result._id,
        }
      } else if (result.status === 'rejected' || result.status === 'invalid') {
        console.error(`Email rejected: ${result.reject_reason}`)
        return {
          success: false,
          error: result.reject_reason || 'Email rejected',
        }
      }
    }

    return { success: false, error: 'Unknown response from Mailchimp' }
  } catch (error: unknown) {
    console.error('Error sending transactional email:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return {
      success: false,
      error: errorMessage,
    }
  }
}
