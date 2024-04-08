import React from "react";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

import { supabase } from "../../../supabaseClient";

const UnauthenticatedLanding = () => {
  return (
    <div>
      <h1>Signed Out!</h1>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={["google"]}
        onlyThirdPartyProviders
      />
    </div>
  );
};

export default UnauthenticatedLanding;
