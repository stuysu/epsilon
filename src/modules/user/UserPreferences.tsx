import * as RadioGroup from "@radix-ui/react-radio-group";
import React from "react";
import { ThemeContext, ThemeMode } from "../../contexts/ThemeProvider";
import { PUBLIC_URL } from "../../config/constants";
import Divider from "../../components/ui/Divider";

const UserPreferences = () => {
    const { mode, setMode } = React.useContext(ThemeContext);

    return (
        <div className="p-10 max-sm:mb-32">
            <h1>Your Preferences</h1>
            <Divider />
            <h2 className={"mb-4"}>Display Theme</h2>
            <RadioGroup.Root
                className="flex flex-col gap-3"
                value={mode}
                onValueChange={(val: string) => setMode(val as ThemeMode)}
                aria-label="Theme preference"
            >
                <RadioGroup.Item
                    value="dark"
                    className="flex gap-2 cursor-pointer"
                >
                    <div className="w-5 h-5 rounded-full border border-divider flex items-center justify-center data-[state=checked]:bg-accent data-[state=checked]:border-accent">
                        <RadioGroup.Indicator className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <div className={"flex flex-col items-start mt-1 mb-8"}>
                        <h4 className={"mb-3"}>The Crisp Night</h4>
                        <img
                            src={`${PUBLIC_URL}/symbols/darkmode.png`}
                            alt="Dark Mode"
                            className="w-64"
                        ></img>
                    </div>
                </RadioGroup.Item>

                <RadioGroup.Item
                    value="light"
                    className="flex gap-2 cursor-pointer"
                >
                    <div className="w-5 h-5 rounded-full border border-divider flex items-center justify-center data-[state=checked]:bg-accent data-[state=checked]:border-accent">
                        <RadioGroup.Indicator className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <div className={"flex flex-col items-start mt-1 mb-8"}>
                        <h4 className={"mb-3"}>The Bright Daylight (Beta)</h4>
                        <img
                            src={`${PUBLIC_URL}/symbols/lightmode.png`}
                            alt="Light Mode"
                            className="w-64"
                        ></img>
                    </div>
                </RadioGroup.Item>

                <RadioGroup.Item
                    value="system"
                    className="flex items-center gap-2 cursor-pointer"
                >
                    <div className="w-5 h-5 rounded-full border border-divider flex items-center justify-center data-[state=checked]:bg-accent data-[state=checked]:border-accent">
                        <RadioGroup.Indicator className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <div><h4 className={"mt-1 text-left"}>Follow System</h4>
                        <p>Uses the system default theme</p></div>
                </RadioGroup.Item>
            </RadioGroup.Root>
        </div>
    );
};

export default UserPreferences;
