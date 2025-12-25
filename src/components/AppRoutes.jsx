import { Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import Index from "../Pages/Index";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<Index />} />
            </Route>
        </Routes>
    );
}