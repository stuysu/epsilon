import { Tab, Tabs } from "@mui/material";
import { useEffect, useState, ReactNode } from "react";
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
    const [currentTab, setCurrentTab] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const isCorrectIndex = location.pathname === tabs[currentTab]?.to;

        if (!isCorrectIndex) {
            const correctIndex = tabs.findIndex(
                (tab) => location.pathname === tab.to,
            );
            setCurrentTab(~correctIndex ? correctIndex : 0);
        }
    }, [location.pathname, currentTab, tabs]);

    return (
        <div className="flex justify-center sticky -top-0.5 mb-10 mt-4
        bg-neutral-900 bg-opacity-75 backdrop-blur-xl border-y-neutral-50 border-opacity-10 border-y z-50">
            <Tabs
                indicatorColor="secondary"
                textColor="inherit"
                value={currentTab}
                scrollButtons
                variant={"scrollable"}
                allowScrollButtonsMobile
            >
                {tabs.map((tab, i) => {
                    let tabProps: any = {
                        key: i,
                        label: tab.label,
                        value: i,
                    };

                    if (tab.icon) tabProps.icon = tab.icon;

                    return (
                        <Tab {...tabProps} onClick={() => navigate(tab.to)} />
                    );
                })}
            </Tabs>
        </div>
    );
};

export default RouteTabs;
