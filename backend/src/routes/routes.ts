import { Router } from 'express';
import VendorRoutes from '../Vendors/Vendor.Routes'
import ItemRoutes  from '../Items/Item.Routes'
import TeamRoutes from '../Team/Team.Routes'
import projectRoutes from '../Project/Project.Routes'
import BoqRoutes from '../BOQ/Boq.Routes'
import IndentRoutes from '../Indent/Indent.Routes';
import PORoutes from '../PurchesOrder/Po.Routes';
import ReportRoutes from '../Report/Report.Routes'

const routes = Router();
 
routes.use('/vendor', VendorRoutes);
routes.use('/item', ItemRoutes);
routes.use('/team', TeamRoutes);
routes.use('/project',projectRoutes);
routes.use('/boq', BoqRoutes);
routes.use('/indent', IndentRoutes);
routes.use('/po', PORoutes);
routes.use('/report', ReportRoutes)


export default routes;
