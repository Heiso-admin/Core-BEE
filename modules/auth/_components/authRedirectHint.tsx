import React from 'react'

const AuthRedirectHint = ({...props}): React.ReactNode => {

  return (
     <div className="text-sm absolute left-1/2 -translate-x-1/2 bottom-3 text-neutral" {...props} />
  )
}

export default AuthRedirectHint
