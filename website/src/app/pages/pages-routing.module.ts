import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";

import { PagesComponent } from "./pages.component";
// import { DashboardComponent } from "./dashboard/dashboard.component";
import { ProjectDetailComponent } from "./project-detail/project-detail.component";
import { ProjectsComponent } from "./projects/projects.component";
import { DeploymentConfigsComponent } from "./deployment-configs/deployment-configs.component";
import { DeploymentConfigDetailComponent } from "./deployment-config-detail/deployment-config-detail.component";
import { DeploymentDetailComponent } from "./deployment-detail/deployment-detail.component";

const routes: Routes = [{
    path: "",
    component: PagesComponent,
    children: [
        // {
        //     path: "dashboard",
        //     component: DashboardComponent,
        // },
        {
            path: "projects",
            component: ProjectsComponent,
        },
        {
            path: "projects/:projectName",
            component: ProjectDetailComponent,
        },
        {
            path: "projects/:projectName/deployments/:deploymentName",
            component: DeploymentDetailComponent,
        },
        {
            path: "deployment-configs",
            component: DeploymentConfigsComponent,
        },
        {
            path: "deployment-configs/:deploymentConfigName",
            component: DeploymentConfigDetailComponent,
        },
        {
            path: "",
            redirectTo: "projects",
            pathMatch: "full",
        },
    ],
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PagesRoutingModule {
}
