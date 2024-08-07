type Requirements = {
    [field: string]: any;
};

type validatorField =
    | "name"
    | "url"
    | "commitment_level"
    | "tags"
    | "keywords"
    | "socials"
    | "picture"
    | "mission"
    | "purpose"
    | "goals"
    | "appointment_procedures"
    | "uniqueness"
    | "meeting_description"
    | "meeting_schedule"
    | "meeting_days"
    | "returning_info"
    | string;

type OrgValidator = {
    [field in validatorField]: {
        required?: boolean;
        requirements?: Requirements;
    };
};

const OrgRequirements: OrgValidator = {
    name: {
        required: true,
        requirements: {
            minChar: 3,
            maxChar: 60,
            onlyAlpha: true,
        },
    },
    url: {
        required: true,
        requirements: {
            minChar: 3,
            maxChar: 40,
            disableSpaces: true,
            onlyAlpha: true,
            lowercase: true,
        },
    },
    commitment_level: {
        required: true,
    },
    tags: {
        required: false,
        requirements: {
            maxSelect: 3,
        },
    },
    keywords: {
        required: false,
        requirements: {
            onlyAlpha: true,
            lowercase: true,
            maxChips: 3,
        },
    },
    socials: {
        required: false,
        requirements: {
            maxChar: 100,
        },
    },
    picture: {
        required: false,
        requirements: {
            maxSize: [5, "MB"],
            types: ["image/*"],
        },
    },
    mission: {
        required: true,
        requirements: {
            minWords: 150,
            maxWords: 400,
        },
    },
    goals: {
        required: true,
        requirements: {
            minWords: 150,
            maxWords: 300,
        },
    },
    purpose: {
        required: true,
        requirements: {
            minWords: 50,
            maxWords: 150,
        },
    },
    appointment_procedures: {
        required: true,
        requirements: {
            minWords: 50,
            maxWords: 100,
        },
    },
    uniqueness: {
        required: true,
        requirements: {
            minWords: 150,
            maxWords: 400,
        },
    },
    meeting_description: {
        required: true,
        requirements: {
            minWords: 150,
            maxWords: 250,
        },
    },
    meeting_schedule: {
        required: true,
        requirements: {
            minWords: 50,
            maxWords: 300,
        },
    },
    meeting_days: {
        required: true,
    },
    returning_info: {
        required: false,
        requirements: {
            minWords: 100,
            maxWords: 300,
        },
    },
};

export default OrgRequirements;
