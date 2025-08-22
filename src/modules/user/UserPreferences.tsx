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
                className="flex flex-col gap-10"
                value={mode}
                onValueChange={(val: string) => setMode(val as ThemeMode)}
                aria-label="Theme preference"
            >
                <RadioGroup.Item
                    value="dark"
                    className="flex gap-2 cursor-pointer"
                >
                    <div className="w-5 h-5 mt-3 rounded-full border border-divider flex items-center justify-center">
                        <RadioGroup.Indicator className="w-2 h-2 rounded-full bg-accent" />
                    </div>
                    <div>
                        <h4 className={"mt-1 text-left"}>Tranquility Base Hotel & Casino</h4>
                        <p className={"mb-3"}>
                            Our default dark theme, perfect for a calm and
                            focused experience with a little bit of fun.
                        </p>
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
                    <div className="w-5 h-5 mt-3 rounded-full border border-divider flex items-center justify-center">
                        <RadioGroup.Indicator className="w-2 h-2 rounded-full bg-accent" />
                    </div>
                    <div>
                        <h4 className={"mt-1 text-left"}>Swimming</h4>
                        <p className={"mb-3"}>
                            Our new light mode inspired by simplicity, with reduced visual noise all around.
                        </p>
                        <img
                            src={`${PUBLIC_URL}/symbols/lightmode.png`}
                            alt="Light Mode"
                            className="w-64"
                        ></img>
                    </div>
                </RadioGroup.Item>

                <RadioGroup.Item
                    value="system"
                    className="flex gap-2 cursor-pointer"
                >
                    <div className="w-5 h-5 mt-3 rounded-full border border-divider flex items-center justify-center">
                        <RadioGroup.Indicator className="w-2 h-2 rounded-full bg-accent" />
                    </div>
                    <div>
                        <h4 className={"mt-1 text-left"}>Automatic</h4>
                        <p className={"mb-3"}>
                            Follow your system's theme preference.
                        </p>
                        <img
                            src={`${PUBLIC_URL}/symbols/auto.png`}
                            alt="Automatic Mode"
                            className="w-64"
                        ></img>
                    </div>
                </RadioGroup.Item>

                <RadioGroup.Item
                    value="dark-hc"
                    className="flex gap-2 cursor-pointer"
                >
                    <div className="w-5 h-5 mt-3 rounded-full border border-divider flex items-center justify-center">
                        <RadioGroup.Indicator className="w-2 h-2 rounded-full bg-accent" />
                    </div>
                    <div>
                        <h4 className={"mt-1 text-left"}>Turn On the Bright Lights</h4>
                        <p className={"mb-3"}>
                            A jet-black, high-contrast theme designed for visibility and accessibility.
                        </p>
                        <img
                            src={`${PUBLIC_URL}/symbols/darkhcmode.png`}
                            alt="Dark High Contrast Mode"
                            className="w-64"
                        ></img>
                    </div>
                </RadioGroup.Item>

                <RadioGroup.Item
                    value="orange"
                    className="flex gap-2 cursor-pointer"
                >
                    <div className="w-5 h-5 mt-3 rounded-full border border-divider flex items-center justify-center">
                        <RadioGroup.Indicator className="w-2 h-2 rounded-full bg-accent" />
                    </div>
                    <div>
                        <h4 className={"mt-1 text-left"}>Everything You've Come to Expect<i className={"bx ml-1 bx-test-tube"}></i></h4>
                        <p className={"mb-3"}>
                            An unapologetically vibrant theme with baroque motifs.
                        </p>
                        <img
                            src={`${PUBLIC_URL}/symbols/orangemode.png`}
                            alt="Orange Mode"
                            className="w-64"
                        ></img>
                    </div>
                </RadioGroup.Item>

            </RadioGroup.Root>
        </div>
    );
};

export default UserPreferences;
