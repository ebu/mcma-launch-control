import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { ProjectsComponent } from "./projects.component";


const routes: Routes = [{
    path: "",
    component: ProjectsComponent,
    children: [],
    //     {
    //         path: 'stepper',
    //         component: StepperComponent,
    //     },
    //     {
    //         path: 'list',
    //         component: ListComponent,
    //     },
    //     {
    //         path: 'infinite-list',
    //         component: InfiniteListComponent,
    //     },
    //     {
    //         path: 'accordion',
    //         component: AccordionComponent,
    //     },
    //     {
    //         path: 'tabs',
    //         component: TabsComponent,
    //         children: [
    //             {
    //                 path: '',
    //                 redirectTo: 'tab1',
    //                 pathMatch: 'full',
    //             },
    //             {
    //                 path: 'tab1',
    //                 component: Tab1Component,
    //             },
    //             {
    //                 path: 'tab2',
    //                 component: Tab2Component,
    //             },
    //         ],
    //     },
    // ],
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ProjectsRoutingModule {
}
