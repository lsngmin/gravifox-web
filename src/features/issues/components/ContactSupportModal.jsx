import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import FeedbackModal from "./FeedbackModal";
import ContactSupportAPI from "../api/contactSupportAPI";

const ContactSupportModal = ({ open, onClose, theme = "light" }) => {
    const { submitContact } = ContactSupportAPI();
    const { t } = useTranslation("support");

    const strings = useMemo(() => {
        const data = t("modals.contact", { returnObjects: true });
        return data && typeof data === "object" ? data : {};
    }, [t]);

    const handleSubmit = (formData) => submitContact(formData);

    return (
        <FeedbackModal
            open={open}
            onClose={onClose}
            theme={theme}
            heading={strings.heading || ""}
            description={strings.description || ""}
            titleLabel={strings.titleLabel || ""}
            titlePlaceholder={strings.titlePlaceholder || ""}
            bodyLabel={strings.bodyLabel || ""}
            bodyPlaceholder={strings.bodyPlaceholder || ""}
            attachmentLabel={strings.attachmentLabel || ""}
            attachmentHint={strings.attachmentHint}
            submitLabel={strings.submitLabel || ""}
            successMessage={strings.successMessage || ""}
            onSubmit={handleSubmit}
        />
    );
};

export default ContactSupportModal;
