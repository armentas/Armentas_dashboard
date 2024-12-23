import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }
  //------------------------- Dashboard Section ----------------------------------

  getAllOrders(): Promise<any> {
    return lastValueFrom(this.http.get<any>(`${this.baseUrl}/dash/getAllOrders`));
  }

  getAllOrdersYear(): Promise<any> {
    return lastValueFrom(this.http.get<any>(`${this.baseUrl}/dash/getAllOrdersYear`));
  }

  getAllOrdersMonth(): Promise<any> {
    return lastValueFrom(this.http.get<any>(`${this.baseUrl}/dash/getAllOrdersMonth`));
  }

  getAllOrdersPreviousMonth(): Promise<any> {
    return lastValueFrom(this.http.get<any>(`${this.baseUrl}/dash/getAllOrdersPreviousMonth`));
  }

  getAllOrdersByDate(start_date: string, end_date: string): Promise<any> {
    return lastValueFrom(this.http.post<any>(`${this.baseUrl}/dash/getAllOrdersByDate`, { start_date, end_date }));
  }

  latestProductsAdded(): Promise<any> {
    return lastValueFrom(this.http.get<any>(`${this.baseUrl}/dash/latestProductsAdded`));
  }

  //-------------------- Orders section -----------------------------------------

  updateOrderStatus(site_order_id: string, data: any): Promise<any> {
    return lastValueFrom(this.http.put<any>(`${this.baseUrl}/dash/updateStatus/${site_order_id}`, { shipping_status: data }));
  }

  getImageUrlFromSku(sku: string): Promise<any> {
    return lastValueFrom(this.http.get<any>(`${this.baseUrl}/dash/getImageUrlFromSku/${sku}`));
  }


  //-------------------- Product section -----------------------------------------

  addProduct(data: any): Promise<any> {
    return lastValueFrom(this.http.post<any>(`${this.baseUrl}/products/addProduct`, data));
  }

  getProduct(id: number): Promise<any> {
    return lastValueFrom(this.http.get<any>(`${this.baseUrl}/products/getProduct/${id}`));
  }

  getAllProducts(): Promise<any> {
    return lastValueFrom(this.http.get<any>(`${this.baseUrl}/products/getAllProducts`));
  }

  updateProduct(id: number, data: any): Promise<any> {
    return lastValueFrom(this.http.put<any>(`${this.baseUrl}/products/updateProduct/${id}`, data));
  }

  deleteProduct(id: number): Promise<any> {
    return lastValueFrom(this.http.delete<any>(`${this.baseUrl}/products/deleteProduct/${id}`));
  }

  getFullProduct(id: number): Promise<any> {
    return lastValueFrom(this.http.get<any>(`${this.baseUrl}/products/getFullProduct/${id}`));
  }

  getAllFullProduct(): Promise<any> {
    return lastValueFrom(this.http.get<any>(`${this.baseUrl}/products/getAllFullProduct`));
  }
  //-------------------- Collections section -----------------------------------------

  getAllCollections(): Promise<any> {
    return lastValueFrom(this.http.get<any>(`${this.baseUrl}/collections/getAllCollections`));
  }

  getCollection(id: number): Promise<any> {
    return lastValueFrom(this.http.get<any>(`${this.baseUrl}/collections/getCollection/${id}`));
  }

  addCollection(data: any): Promise<any> {
    return lastValueFrom(this.http.post<any>(`${this.baseUrl}/collections/addCollection`, data));
  }

  updateCollection(id: number, data: any): Promise<any> {
    return lastValueFrom(this.http.put<any>(`${this.baseUrl}/collections/updateCollection/${id}`, data));
  }

  deleteCollection(id: number): Promise<any> {
    return lastValueFrom(this.http.delete<any>(`${this.baseUrl}/collections/deleteCollection/${id}`));
  }

  addImageFileCollection(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('image', file);

    return lastValueFrom(this.http.post<any>(`${this.baseUrl}/collections/addImageFile/`, formData));
  }
  //-------------------- Categories section -----------------------------------------

  getAllCategories(): Promise<any> {
    return lastValueFrom(this.http.get<any>(`${this.baseUrl}/categories/getAllCategories`));
  }

  getCategory(id: number): Promise<any> {
    return lastValueFrom(this.http.get<any>(`${this.baseUrl}/categories/getCategory/${id}`));
  }

  addCategory(data: any): Promise<any> {
    return lastValueFrom(this.http.post<any>(`${this.baseUrl}/categories/addCategory`, data));
  }

  updateCategory(id: number, data: any): Promise<any> {
    return lastValueFrom(this.http.put<any>(`${this.baseUrl}/categories/updateCategory/${id}`, data));
  }

  deleteCategory(id: number): Promise<any> {
    return lastValueFrom(this.http.delete<any>(`${this.baseUrl}/categories/deleteCategory/${id}`));
  }

  //-------------------- Colors section -----------------------------------------

  getAllColors(): Promise<any> {
    return lastValueFrom(this.http.get<any>(`${this.baseUrl}/colors/getAllColors`));
  }

  getColor(id: number): Promise<any> {
    return lastValueFrom(this.http.get<any>(`${this.baseUrl}/colors/getColor/${id}`));
  }

  addColor(data: any): Promise<any> {
    return lastValueFrom(this.http.post<any>(`${this.baseUrl}/colors/addColor`, data));
  }

  updateColor(id: number, data: any): Promise<any> {
    return lastValueFrom(this.http.put<any>(`${this.baseUrl}/colors/updateColor/${id}`, data));
  }

  deleteColor(id: number): Promise<any> {
    return lastValueFrom(this.http.delete<any>(`${this.baseUrl}/colors/deleteColor/${id}`));
  }

  //-------------------- Image section -----------------------------------------

  addImageUrl(id_product: number, data: any): Promise<any> {
    return lastValueFrom(this.http.post<any>(`${this.baseUrl}/images/addImageUrl/${id_product}`, data));
  }

  addImageFile(id_product: number, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('image', file);

    return lastValueFrom(this.http.post<any>(`${this.baseUrl}/images/addImageFile/${id_product}`, formData));
  }

  getAllImageByProductId(id: number): Promise<any> {
    return lastValueFrom(this.http.get<any>(`${this.baseUrl}/images/getImageByProductId/${id}`));
  }

  updateImage(id: number, data: any): Promise<any> {
    return lastValueFrom(this.http.put<any>(`${this.baseUrl}/images/updateImage/${id}`, data));
  }

  deleteImage(id: number): Promise<any> {
    return lastValueFrom(this.http.delete<any>(`${this.baseUrl}/images/deleteImage/${id}`));
  }






}
