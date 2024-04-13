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

   //-------------------- Relationship Variant-Image section -----------------------------------------

  addRelationshipVariantImage(data: any): Promise<any> {
    return lastValueFrom(this.http.post<any>(`${this.baseUrl}/images/addLinkImage`, data));
  }

  //---------------------- Gallery section -------------------------------------------------------------

  addImageGallery(data: any): Promise<any> {
    return lastValueFrom(this.http.post<any>(`${this.baseUrl}/gallery/addImage`, data));
  }

  deleteImageGallery(id: number): Promise<any> {
    return lastValueFrom(this.http.delete<any>(`${this.baseUrl}/gallery/deleteImage/${id}`));
  }

  getImageGallery(id: number): Promise<any> {
    return lastValueFrom(this.http.get<any>(`${this.baseUrl}/gallery/getImage/${id}`));
  }

  getAllImagesGallery(): Promise<any> {
    return lastValueFrom(this.http.get<any>(`${this.baseUrl}/gallery/getAllImages`));
  }




}
