import React from "react"

import GoogleLogin from "../auth/GoogleLogin"

const UnauthenticatedLanding = () => {
    return (
        <div>
            <h1>Signed Out!</h1>
            <GoogleLogin />
        </div>
    )
}

export default UnauthenticatedLanding