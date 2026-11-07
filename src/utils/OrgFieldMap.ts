// Mappers of Organization field name (database column) to human-readable names
import { capitalizeWords } from "./DataFormatters";

const textFieldMap: { [index: string]: string } = {
    purpose: "Club Description",
    url: "URL",
};

const OrgFieldMap = (field: string): string => {
    return textFieldMap[field] || capitalizeWords(field.split("_").join(" "));
};

export default OrgFieldMap;
