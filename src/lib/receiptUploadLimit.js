/** Server response when a Free user exceeds the daily receipt scan limit. */
export function isFreeTierDailyLimitResponse(res, data) {
  return res?.status === 403 && data?.code === 'FREE_TIER_DAILY_LIMIT'
}

export const FREE_TIER_LIMIT_FALLBACK_MESSAGE =
  "You've reached today's limit of 5 receipt scans on the Free plan. Upgrade to Pro for unlimited uploads."
