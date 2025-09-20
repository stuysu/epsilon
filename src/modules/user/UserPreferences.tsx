import * as RadioGroup from "@radix-ui/react-radio-group";
import React from "react";
import { ThemeContext, ThemeMode } from "../../contexts/ThemeProvider";
import { PUBLIC_URL } from "../../config/constants";
import Divider from "../../components/ui/Divider";
import LoginGate from "../../components/ui/content/LoginGate";

const UserPreferences = () => {
    const { mode, setMode } = React.useContext(ThemeContext);

    return (
        <LoginGate page={"adjust your preferences"}>
            <div className={"sm:m-12 m-6"}>
                <h1>Preferences</h1>
                <p>Make Epsilon yours.</p>
                <Divider />

                <div className={"flex flex-col sticky top-0"}>
                    <div className={"bg-bg pb-4 pt-3 "}>
                        <h2>Display Theme</h2>
                        <p>Define the visual look of Epsilon.</p>
                    </div>
                    <div className="bg-gradient-to-b from-bg to-transparent w-full h-4" />
                </div>

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
                        <div className="min-w-5 h-5 mt-3 rounded-full border border-typography-3 flex items-center justify-center">
                            <RadioGroup.Indicator className="w-3 h-3 rounded-full bg-accent" />
                        </div>
                        <div>
                            <h4 className={"mt-1 text-left"}>
                                Tranquility Base Hotel & Casino
                            </h4>
                            <p className={"mb-3 text-left"}>
                                Our default dark theme, perfect for a focused
                                experience that's a little classy.
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
                        <div className="min-w-5 h-5 mt-3 rounded-full border border-typography-3 flex items-center justify-center">
                            <RadioGroup.Indicator className="w-3 h-3 rounded-full bg-accent" />
                        </div>
                        <div>
                            <h4 className={"mt-1 text-left"}>Swimming</h4>
                            <p className={"mb-3 text-left"}>
                                Our new light mode inspired by simplicity, with
                                reduced visual noise all around.
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
                        <div className="min-w-5 h-5 mt-3 rounded-full border border-typography-3 flex items-center justify-center">
                            <RadioGroup.Indicator className="w-3 h-3 rounded-full bg-accent" />
                        </div>
                        <div>
                            <h4 className={"mt-1 text-left"}>Automatic</h4>
                            <p className={"mb-3 text-left"}>
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
                        <div className="min-w-5 h-5 mt-3 rounded-full border border-typography-3 flex items-center justify-center">
                            <RadioGroup.Indicator className="w-3 h-3 rounded-full bg-accent" />
                        </div>
                        <div>
                            <h4 className={"mt-1 text-left"}>
                                Turn On the Bright Lights
                            </h4>
                            <p className={"mb-3 text-left"}>
                                A jet-black, high-contrast theme designed for
                                visibility.
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
                        <div className="min-w-5 h-5 mt-3 rounded-full border border-typography-3 flex items-center justify-center">
                            <RadioGroup.Indicator className="w-3 h-3 rounded-full bg-accent" />
                        </div>
                        <div>
                            <h4 className={"mt-1 text-left"}>
                                Everything You've Come to Expect
                                <i className={"bx ml-1 bx-test-tube"}></i>
                            </h4>
                            <p className={"mb-3 text-left"}>
                                An unapologetically vibrant theme with baroque
                                motifs. Funsies only.
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
        </LoginGate>
    );
};

export default UserPreferences;
