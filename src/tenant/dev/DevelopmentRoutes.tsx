import { Route, Routes } from 'react-router-dom';
import DesignWorkbench from './DesignWorkbench';

/** Development-only routes are isolated so their paths and fixtures are absent from production bundles. */
export default function DevelopmentRoutes() {
  return (
    <Routes>
      <Route path="/admin/design-system" element={<DesignWorkbench />} />
    </Routes>
  );
}
