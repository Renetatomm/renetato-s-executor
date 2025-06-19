export interface ExecutorKey {
  id: string
  key: string
  createdAt: Date
  expiresAt: Date
  isUsed: boolean
  usedAt?: Date
  ipAddress?: string
}

export interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      date: string
    }
  }
  html_url: string
}

export interface KeyGenerationResponse {
  success: boolean
  key?: string
  expiresAt?: string
  cooldownRemaining?: number
  error?: string
}
