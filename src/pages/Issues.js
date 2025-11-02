import React from "react";

import Header from "../app/layout/Header";
import Footer from "../app/layout/Footer/Footer";
import IssueTable from "features/issues/issueTable";

const Issues = () => {
    return (<>
            <Header />
            <IssueTable/>
            <Footer />
        </>
    );
};

export default Issues;
