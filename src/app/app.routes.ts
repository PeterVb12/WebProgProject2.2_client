import { Routes } from '@angular/router';
import {FrontpageComponent} from './components/frontpage/frontpage.component'
import {ActivityMapComponent} from './components/activity/activity-map/activity-map.component'
import { ActivityCreateComponent } from './components/activity/activity-create/activity-create.component';
import { ActivityDetailsComponent } from './components/activity/activity-details/activity-details.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { LoginComponent } from './components/auth/login/login.component';
import { ActivityListComponent } from './components/activity/activity-list/activity-list.component';
import { AuthGuard } from './components/auth/guards/auth.guard';
export const routes: Routes = [
    {path: '', redirectTo: '/frontpage', pathMatch: 'full' },
    {path: 'frontpage', component: FrontpageComponent },
    {path: 'activity', component: ActivityMapComponent, canActivate: [AuthGuard] },
    {path: 'createactivity', component: ActivityCreateComponent, canActivate: [AuthGuard]},
    {path: 'detailsactivity/:id', component: ActivityDetailsComponent, canActivate: [AuthGuard]},
    {path: 'register', component: RegisterComponent},
    {path: 'detailsactivity', component: ActivityDetailsComponent, canActivate: [AuthGuard]},
    {path: 'login', component: LoginComponent },
    {path: 'my-activities', component: ActivityListComponent, canActivate: [AuthGuard] }

    

];
