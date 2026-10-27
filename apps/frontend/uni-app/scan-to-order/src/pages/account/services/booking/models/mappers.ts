/** 仅确认接口已接受报名，不代表门店已经占座。 */
export function isAccepted(value: unknown): value is { accepted: true } {
  return !!value && typeof value === 'object' && 'accepted' in value && value.accepted === true
}
