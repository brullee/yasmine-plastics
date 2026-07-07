// Registered as admin.avatar in payload.config.ts — replaces Payload's Gravatar lookup
// (which falls back to a generic gray "mystery person" silhouette since no Gravatar account
// exists for the admin email) with the site's own icon-dark.svg (white background, reads
// well in the circular badge against the dark admin theme).
export function AdminAvatar() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/icon-dark.svg"
      alt=""
      className="gravatar-account"
      width={25}
      height={25}
      style={{ borderRadius: '50%' }}
    />
  )
}
