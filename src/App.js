import { BrowserRouter as Router } from "react-router-dom";
import { Suspense } from 'react';
import { AuthProvider } from "providers/authProvider";
import CustomRoutes from "routes/routes";
import { AnalyzeFlowProvider } from './features/analyze/contexts/AnalyzeFlowContext';
import "output.css";
import './i18n';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Suspense fallback={<div />}>
                    <AnalyzeFlowProvider>
                        <CustomRoutes/>
                    </AnalyzeFlowProvider>
                </Suspense>
            </Router>
        </AuthProvider>
    );
}
export default App;
