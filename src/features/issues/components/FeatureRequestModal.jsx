import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import FeedbackModal from "./FeedbackModal";
import FeatureRequestAPI from "../api/featureRequestAPI";

const FeatureRequestModal = ({ open, onClose, theme = "light" }) => {
    const { submitFeature } = FeatureRequestAPI();
    const { t } = useTranslation("support");

    const strings = useMemo(() => {
        const data = t("modals.feature", { returnObjects: true });
        return data && typeof data === "object" ? data : {};
    }, [t]);

    const handleSubmit = (formData) => submitFeature(formData);

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

export default FeatureRequestModal;
