import React from "react"
import UserContext from "../../context/UserContext"

import { Link } from "react-router-dom"

const UserHome = () => {
    const user = React.useContext(UserContext)

    return (
        <div>
            <h1>Signed In!</h1>
            <h2>Here's the context</h2>
            <pre>{JSON.stringify(user, undefined, 4)}</pre>
            <div>
                <Link to="/catalog">Catalog</Link>
                <Link to="/create">Create</Link>
            </div>
        </div>
    )
}

export default UserHome