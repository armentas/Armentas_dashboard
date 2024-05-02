import { Injectable, HostListener, Inject } from '@angular/core';
import { BehaviorSubject, Observable, Subscriber } from 'rxjs';
import { WINDOW } from "./windows.service";
// Menu
export interface Menu {
	path?: string;
	title?: string;
	icon?: string;
	type?: string;
	badgeType?: string;
	badgeValue?: string;
	active?: boolean;
	bookmark?: boolean;
	children?: Menu[];
}

@Injectable({
	providedIn: 'root'
})

export class NavService {

	public screenWidth: any
	public collapseSidebar: boolean = false

	constructor(@Inject(WINDOW) private window) {
		this.onResize();
		if (this.screenWidth < 991) {
			this.collapseSidebar = true
		}
	}

	// Windows width
	@HostListener("window:resize", ['$event'])
	onResize(event?) {
		this.screenWidth = window.innerWidth;
	}

	MENUITEMS: Menu[] = [
		{
			path: '/dashboard/default', title: 'Dashboard', icon: 'home', type: 'link', badgeType: 'primary', active: false
		},
		{
			title: 'Products', icon: 'box', type: 'sub', active: false, children: [
				{ path: '/products/digital/digital-product-list', title: 'Product catalog', type: 'link' },
				{ path: '/products/digital/digital-add-product', title: 'Add product', type: 'link' },
				{ path: '/products/digital/digital-import-listing', title: 'Import listing', type: 'link' },
			]
		},
		{
			title: 'Sales', icon: 'dollar-sign', type: 'sub', active: false, children: [
				{ path: '/sales/orders', title: 'Orders', type: 'link' },
			]
		},
		{
			title: 'Users', icon: 'user-plus', type: 'sub', active: false, children: [
				{ path: '/users/list-user', title: 'User List', type: 'link' },
				// { path: '/users/create-user', title: 'Create User', type: 'link' },
			]
		},
		// {
		// 	path: '/gallery/image-list', title: 'Gallery', icon: 'image', type: 'link', badgeType: 'primary', active: false
		// },
		// {
		// 	title: 'Gallery', icon: 'bar-chart', type: 'link', active: false, children: [
		// 		{ path: '/reports', title: 'Reports', type: 'link' },
		// 		{ path: '/sales/orders', title: 'Sales', type: 'link' }
		// 	]
		// },
		// {
		// 	title: 'Settings', icon: 'settings', type: 'sub', children: [
		// 		{ path: '/settings/profile', title: 'Profile', type: 'link' },
		// 	]
		// },
		{
			title: 'Logout', path: '/auth/login', icon: 'log-in', type: 'link', active: false
		}
	]
	// Array
	items = new BehaviorSubject<Menu[]>(this.MENUITEMS);


}
