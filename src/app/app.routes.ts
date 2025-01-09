import { Routes } from '@angular/router';
import {FrontpageComponent} from './components/frontpage/frontpage.component'
import {ActivityMapComponent} from './components/activity/activity-map/activity-map.component'

export const routes: Routes = [] = [
    // { path: '', redirectTo: '/frontpage', pathMatch: 'full' },
    {path: 'frontpage', component: FrontpageComponent },
    {path: 'activity', component: ActivityMapComponent },

];
