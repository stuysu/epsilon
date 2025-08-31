import { Tabs } from "radix-ui";
import { ReactNode, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type TabProps = {
    to: string;
    label: string;
    icon?: ReactNode;
};

type Props = {
    tabs: TabProps[];
};

const RouteTabs = ({ tabs }: Props) => {
    const location = useLocation();
    const navigate = useNavigate();

    const activeValue = useMemo(() => {
        const found = tabs.find((t) => t.to === location.pathname);
        return found ? found.to : tabs[0]?.to ?? "";
    }, [location.pathname, tabs]);

    return (
        <Tabs.Root
            value={activeValue}
            onValueChange={(v) => {
                if (v && v !== activeValue) navigate(v);
            }}
        >
            <Tabs.List aria-label="Routes" className={"flex"}>
                {tabs.map((tab) => (
                    <Tabs.Trigger
                        key={tab.to}
                        value={tab.to}
                        className={
                            "flex-col flex items-center text important p-2 data-[state=active]:text-yellow text-typography-3"
                        }
                    >
                        {tab.icon && (
                            <div className={"flex items-center gap-1"}>
                                <i
                                    className={`bx bx-sm ${tab.icon} relative top-px p-1`}
                                    aria-hidden="true"
                                    title={tab.label}
                                />
                                <span className={"text-nowrap"}>
                                    {tab.label}
                                </span>
                            </div>
                        )}
                    </Tabs.Trigger>
                ))}
            </Tabs.List>

            {tabs.map((tab) => (
                <Tabs.Content key={tab.to} value={tab.to} />
            ))}
        </Tabs.Root>
    );
};

export default RouteTabs;
