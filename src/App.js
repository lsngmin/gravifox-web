import { BrowserRouter as Router} from "react-router-dom";
import {AuthProvider} from "providers/authProvider";
import CustomRoutes from "routes/routes";
import "output.css";
import './i18n';
import { Suspense } from 'react';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Suspense fallback={<div />}> 
                    <CustomRoutes/>
                </Suspense>
            </Router>
        </AuthProvider>
    );
}
export default App;
