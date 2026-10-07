// Real sample response from IndiaMART's Seller Feed Listing API (POST /feed/listing,
// buyer flow). Used as the data source for the top-fold "stories" row — see
// parseTopFoldStories() below for how the raw shape is turned into story groups.
export interface FeedListingResponse {
  Code: number;
  Status: string;
  UniqueId: string;
  Reason?: string;
  Data?: {
    Page: number;
    PageSize: number;
    Count: number;
    TotalCount?: number;
    TotalPages?: number;
    Posts: Record<string, FeedListingPost>;
  };
}

export interface FeedListingPost {
  CallCount: number;
  Caption: string | null;
  CatalogUrl: string;
  CityId: number | null;
  CityName: string | null;
  CompanyLogo: string | null;
  CompanyName: string;
  CountryIso: string | null;
  CreatedAt: string;
  CreatedBy: number;
  EnquiryCount: number;
  FeedMediaId: number;
  FeedPostId: number;
  ImageGalleryId: number;
  ImageOriginalPath: string;
  ImageVariants: {
    '1000x1000'?: string;
    '500x500'?: string;
    Original?: string;
  };
  LikeFlag: boolean;
  LikesCount: number;
  McatId: number | null;
  McatName: string | null;
  MediaTypeId: number;
  PostMediaType: string;
  PostTypeId: number;
  PostTypeName: string;
  ProductName: string | null;
  SellerId: number;
  SellerName: string;
  SellerPnsNumber: string | null;
  Source: string | null;
  StateId: number | null;
  StateName: string | null;
  ThumbnailUrl: string | null;
  Type: string;
  UpdatedAt: string;
  ViewsCount: number;
  WhatsappCount: number;
}

// Mock of a real POST /feed/listing response — swap this for the live API call
// when one is wired up; parseTopFoldStories() below doesn't care where it comes from.
export const topFoldListingResponse: FeedListingResponse = {
  "Code": 200,
  "Status": "Success",
  "UniqueId": "db32dmf8oclc72oq8tfgdb32dmf8oclc72oq8tg0db32dmf8oclc72oq8tgg",
  "Data": {
    "Count": 10,
    "Page": 1,
    "PageSize": 10,
    "Posts": {
      "1": {
        "CallCount": 0,
        "Caption": "",
        "CatalogUrl": "https://www.indiamart.com/siddhiadvertising-indore/",
        "CityId": 70592,
        "CityName": "Indore",
        "CompanyLogo": null,
        "CompanyName": "Siddhi Advertising",
        "CountryIso": "IN",
        "CreatedAt": "2026-10-07T16:18:34.190938Z",
        "CreatedBy": -1,
        "EnquiryCount": 0,
        "FeedMediaId": 953824,
        "FeedPostId": 957967,
        "ImageGalleryId": 651070744,
        "ImageOriginalPath": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/651070744/JP/VI/LT/271471633/feedpost-jpeg.jpg",
        "ImageVariants": {
          "1000x1000": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/651070744/JP/VI/LT/271471633/feedpost-jpeg-1000x1000.jpg",
          "500x500": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/651070744/JP/VI/LT/271471633/feedpost-jpeg-500x500.jpg",
          "Original": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/651070744/JP/VI/LT/271471633/feedpost-jpeg.jpg"
        },
        "LikeFlag": false,
        "LikesCount": 1,
        "McatId": 99972,
        "McatName": "Stainless Steel Coffee Mug",
        "MediaTypeId": 1,
        "PostMediaType": "Image",
        "PostTypeId": 1,
        "PostTypeName": "NewOffer",
        "ProductName": "stainless steel vacuum insulated coffee mug",
        "SellerId": 271471633,
        "SellerName": "Digpal Rajput",
        "SellerPnsNumber": "7942966118",
        "Source": null,
        "StateId": 6488,
        "StateName": "Madhya Pradesh",
        "ThumbnailUrl": null,
        "Type": "image",
        "UpdatedAt": "2026-10-07T16:18:34.190938Z",
        "ViewsCount": 0,
        "WhatsappCount": 0
      },
      "10": {
        "CallCount": 0,
        "Caption": "",
        "CatalogUrl": "https://www.indiamart.com/new-vivek-creation/",
        "CityId": 70490,
        "CityName": "Surat",
        "CompanyLogo": null,
        "CompanyName": "NEW VIVEK CREATION",
        "CountryIso": "IN",
        "CreatedAt": "2026-10-07T09:14:40.930372Z",
        "CreatedBy": -1,
        "EnquiryCount": 0,
        "FeedMediaId": 949321,
        "FeedPostId": 953464,
        "ImageGalleryId": 650872411,
        "ImageOriginalPath": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/650872411/AT/ZZ/MJ/153678793/feedpost-jpeg.jpg",
        "ImageVariants": {
          "1000x1000": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/650872411/AT/ZZ/MJ/153678793/feedpost-jpeg-1000x1000.jpg",
          "500x500": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/650872411/AT/ZZ/MJ/153678793/feedpost-jpeg-500x500.jpg",
          "Original": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/650872411/AT/ZZ/MJ/153678793/feedpost-jpeg.jpg"
        },
        "LikeFlag": false,
        "LikesCount": 5,
        "McatId": 192516,
        "McatName": "Pom Pom Lace",
        "MediaTypeId": 1,
        "PostMediaType": "Image",
        "PostTypeId": 1,
        "PostTypeName": "NewOffer",
        "ProductName": "white pom pom lace trim border",
        "SellerId": 153678793,
        "SellerName": "Sugan",
        "SellerPnsNumber": "8047659391",
        "Source": null,
        "StateId": 6480,
        "StateName": "Gujarat",
        "ThumbnailUrl": null,
        "Type": "image",
        "UpdatedAt": "2026-10-07T09:14:40.930372Z",
        "ViewsCount": 0,
        "WhatsappCount": 0
      },
      "2": {
        "CallCount": 0,
        "Caption": "",
        "CatalogUrl": "https://www.indiamart.com/srijainelectronics-hyderabad/",
        "CityId": 70435,
        "CityName": "Hyderabad",
        "CompanyLogo": null,
        "CompanyName": "Sri Jain Electronics",
        "CountryIso": "IN",
        "CreatedAt": "2026-10-07T15:55:21.010498Z",
        "CreatedBy": -1,
        "EnquiryCount": 0,
        "FeedMediaId": 953574,
        "FeedPostId": 957717,
        "ImageGalleryId": 651056005,
        "ImageOriginalPath": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/651056005/XX/NU/JU/149222743/feedpost-jpeg.jpg",
        "ImageVariants": {
          "1000x1000": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/651056005/XX/NU/JU/149222743/feedpost-jpeg-1000x1000.jpg",
          "500x500": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/651056005/XX/NU/JU/149222743/feedpost-jpeg-500x500.jpg",
          "Original": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/651056005/XX/NU/JU/149222743/feedpost-jpeg.jpg"
        },
        "LikeFlag": false,
        "LikesCount": 0,
        "McatId": null,
        "McatName": null,
        "MediaTypeId": 1,
        "PostMediaType": "Image",
        "PostTypeId": 1,
        "PostTypeName": "NewOffer",
        "ProductName": null,
        "SellerId": 149222743,
        "SellerName": "Abhishek",
        "SellerPnsNumber": "7942820501",
        "Source": null,
        "StateId": 7705,
        "StateName": "Telangana",
        "ThumbnailUrl": null,
        "Type": "image",
        "UpdatedAt": "2026-10-07T15:55:21.010498Z",
        "ViewsCount": 0,
        "WhatsappCount": 0
      },
      "3": {
        "CallCount": 0,
        "Caption": "",
        "CatalogUrl": "https://www.nmenterprises.in/",
        "CityId": 70532,
        "CityName": "Bengaluru",
        "CompanyLogo": null,
        "CompanyName": "N M Enterprises",
        "CountryIso": "IN",
        "CreatedAt": "2026-10-07T14:51:53.174247Z",
        "CreatedBy": -1,
        "EnquiryCount": 0,
        "FeedMediaId": 952850,
        "FeedPostId": 956993,
        "ImageGalleryId": 651018187,
        "ImageOriginalPath": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/651018187/XX/XG/HJ/65569693/feedpost-jpeg.jpg",
        "ImageVariants": {
          "1000x1000": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/651018187/XX/XG/HJ/65569693/feedpost-jpeg-1000x1000.jpg",
          "500x500": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/651018187/XX/XG/HJ/65569693/feedpost-jpeg-500x500.jpg",
          "Original": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/651018187/XX/XG/HJ/65569693/feedpost-jpeg.jpg"
        },
        "LikeFlag": false,
        "LikesCount": 1,
        "McatId": 24893,
        "McatName": "Chromium Trioxide",
        "MediaTypeId": 1,
        "PostMediaType": "Image",
        "PostTypeId": 1,
        "PostTypeName": "NewOffer",
        "ProductName": "vishnu chemicals 50kg chromium trioxide drum",
        "SellerId": 65569693,
        "SellerName": "Narasimharaju K",
        "SellerPnsNumber": "8047633846",
        "Source": null,
        "StateId": 6485,
        "StateName": "Karnataka",
        "ThumbnailUrl": null,
        "Type": "image",
        "UpdatedAt": "2026-10-07T14:51:53.174247Z",
        "ViewsCount": 0,
        "WhatsappCount": 0
      },
      "4": {
        "CallCount": 0,
        "Caption": "",
        "CatalogUrl": "https://www.indiamart.com/shivamconstructionharyana/",
        "CityId": 73693,
        "CityName": "Hisar",
        "CompanyLogo": null,
        "CompanyName": "Shivam Construction",
        "CountryIso": "IN",
        "CreatedAt": "2026-10-07T14:22:23.558878Z",
        "CreatedBy": -1,
        "EnquiryCount": 0,
        "FeedMediaId": 952305,
        "FeedPostId": 956448,
        "ImageGalleryId": 651002528,
        "ImageOriginalPath": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/651002528/LO/ML/BR/75913833/feedpost-jpeg.jpg",
        "ImageVariants": {
          "1000x1000": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/651002528/LO/ML/BR/75913833/feedpost-jpeg-1000x1000.jpg",
          "500x500": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/651002528/LO/ML/BR/75913833/feedpost-jpeg-500x500.jpg",
          "Original": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/651002528/LO/ML/BR/75913833/feedpost-jpeg.jpg"
        },
        "LikeFlag": false,
        "LikesCount": 3,
        "McatId": 37276,
        "McatName": "Socket Wrenches",
        "MediaTypeId": 1,
        "PostMediaType": "Image",
        "PostTypeId": 1,
        "PostTypeName": "NewOffer",
        "ProductName": "chrome vanadium steel socket wrench set",
        "SellerId": 75913833,
        "SellerName": "Shivam",
        "SellerPnsNumber": "8047842150",
        "Source": null,
        "StateId": 6481,
        "StateName": "Haryana",
        "ThumbnailUrl": null,
        "Type": "image",
        "UpdatedAt": "2026-10-07T14:22:23.558878Z",
        "ViewsCount": 0,
        "WhatsappCount": 0
      },
      "5": {
        "CallCount": 0,
        "Caption": "",
        "CatalogUrl": "https://www.indiamart.com/nakoda-marbles-minerals-bengaluru/",
        "CityId": 70532,
        "CityName": "Bengaluru",
        "CompanyLogo": null,
        "CompanyName": "Nakoda Marbles & Minerals",
        "CountryIso": "IN",
        "CreatedAt": "2026-10-07T14:13:35.477383Z",
        "CreatedBy": -1,
        "EnquiryCount": 0,
        "FeedMediaId": 951710,
        "FeedPostId": 955853,
        "ImageGalleryId": 650998013,
        "ImageOriginalPath": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/650998013/JM/MJ/NZ/137253983/feedpost-jpeg.jpg",
        "ImageVariants": {
          "1000x1000": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/650998013/JM/MJ/NZ/137253983/feedpost-jpeg-1000x1000.jpg",
          "500x500": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/650998013/JM/MJ/NZ/137253983/feedpost-jpeg-500x500.jpg",
          "Original": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/650998013/JM/MJ/NZ/137253983/feedpost-jpeg.jpg"
        },
        "LikeFlag": false,
        "LikesCount": 2,
        "McatId": 182835,
        "McatName": "Grey Granite",
        "MediaTypeId": 1,
        "PostMediaType": "Image",
        "PostTypeId": 1,
        "PostTypeName": "NewOffer",
        "ProductName": "grey granite stone slab for flooring",
        "SellerId": 137253983,
        "SellerName": "Manish",
        "SellerPnsNumber": "7942618310",
        "Source": null,
        "StateId": 6485,
        "StateName": "Karnataka",
        "ThumbnailUrl": null,
        "Type": "image",
        "UpdatedAt": "2026-10-07T14:13:35.477383Z",
        "ViewsCount": 0,
        "WhatsappCount": 0
      },
      "6": {
        "CallCount": 0,
        "Caption": "",
        "CatalogUrl": "https://www.indiamart.com/rudrauvmachine-newdelhi/",
        "CityId": 70469,
        "CityName": "New Delhi",
        "CompanyLogo": null,
        "CompanyName": "Rudra UV Machine",
        "CountryIso": "IN",
        "CreatedAt": "2026-10-07T10:26:24.686736Z",
        "CreatedBy": -1,
        "EnquiryCount": 0,
        "FeedMediaId": 949325,
        "FeedPostId": 953468,
        "ImageGalleryId": 650889664,
        "ImageOriginalPath": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/650889664/IF/WS/AG/91344833/feedpost-jpeg.jpg",
        "ImageVariants": {
          "1000x1000": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/650889664/IF/WS/AG/91344833/feedpost-jpeg-1000x1000.jpg",
          "500x500": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/650889664/IF/WS/AG/91344833/feedpost-jpeg-500x500.jpg",
          "Original": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/650889664/IF/WS/AG/91344833/feedpost-jpeg.jpg"
        },
        "LikeFlag": false,
        "LikesCount": 5,
        "McatId": 139489,
        "McatName": "UV Coating Machine",
        "MediaTypeId": 1,
        "PostMediaType": "Image",
        "PostTypeId": 1,
        "PostTypeName": "NewOffer",
        "ProductName": "rudra industrial uv coating machine",
        "SellerId": 91344833,
        "SellerName": "RAJAT Diwakar",
        "SellerPnsNumber": "8048213415",
        "Source": null,
        "StateId": 6478,
        "StateName": "Delhi",
        "ThumbnailUrl": null,
        "Type": "image",
        "UpdatedAt": "2026-10-07T10:26:24.686736Z",
        "ViewsCount": 0,
        "WhatsappCount": 0
      },
      "7": {
        "CallCount": 0,
        "Caption": "",
        "CatalogUrl": "https://www.indiamart.com/rashyaafoods-faridabad/",
        "CityId": 70496,
        "CityName": "Faridabad",
        "CompanyLogo": null,
        "CompanyName": "Rashyaa Foods",
        "CountryIso": "IN",
        "CreatedAt": "2026-10-07T09:41:16.499191Z",
        "CreatedBy": -1,
        "EnquiryCount": 0,
        "FeedMediaId": 949324,
        "FeedPostId": 953467,
        "ImageGalleryId": 650876692,
        "ImageOriginalPath": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/650876692/SD/VP/BV/257306083/feedpost-jpeg.jpg",
        "ImageVariants": {
          "1000x1000": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/650876692/SD/VP/BV/257306083/feedpost-jpeg-1000x1000.jpg",
          "500x500": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/650876692/SD/VP/BV/257306083/feedpost-jpeg-500x500.jpg",
          "Original": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/650876692/SD/VP/BV/257306083/feedpost-jpeg.jpg"
        },
        "LikeFlag": false,
        "LikesCount": 5,
        "McatId": 24076,
        "McatName": "Chili Peppers",
        "MediaTypeId": 1,
        "PostMediaType": "Image",
        "PostTypeId": 1,
        "PostTypeName": "NewOffer",
        "ProductName": "dried red whole chili peppers",
        "SellerId": 257306083,
        "SellerName": "RASHYAA FOODS",
        "SellerPnsNumber": "7942661658",
        "Source": null,
        "StateId": 6481,
        "StateName": "Haryana",
        "ThumbnailUrl": null,
        "Type": "image",
        "UpdatedAt": "2026-10-07T09:41:16.499191Z",
        "ViewsCount": 0,
        "WhatsappCount": 0
      },
      "8": {
        "CallCount": 0,
        "Caption": "",
        "CatalogUrl": "https://www.indiamart.com/rashyaafoods-faridabad/",
        "CityId": 70496,
        "CityName": "Faridabad",
        "CompanyLogo": null,
        "CompanyName": "Rashyaa Foods",
        "CountryIso": "IN",
        "CreatedAt": "2026-10-07T09:40:54.132696Z",
        "CreatedBy": -1,
        "EnquiryCount": 0,
        "FeedMediaId": 949323,
        "FeedPostId": 953466,
        "ImageGalleryId": 650876631,
        "ImageOriginalPath": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/650876631/CC/VH/VG/257306083/feedpost-jpeg.jpg",
        "ImageVariants": {
          "1000x1000": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/650876631/CC/VH/VG/257306083/feedpost-jpeg-1000x1000.jpg",
          "500x500": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/650876631/CC/VH/VG/257306083/feedpost-jpeg-500x500.jpg",
          "Original": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/650876631/CC/VH/VG/257306083/feedpost-jpeg.jpg"
        },
        "LikeFlag": false,
        "LikesCount": 5,
        "McatId": 24076,
        "McatName": "Chili Peppers",
        "MediaTypeId": 1,
        "PostMediaType": "Image",
        "PostTypeId": 1,
        "PostTypeName": "NewOffer",
        "ProductName": "dried red whole chili peppers",
        "SellerId": 257306083,
        "SellerName": "RASHYAA FOODS",
        "SellerPnsNumber": "7942661658",
        "Source": null,
        "StateId": 6481,
        "StateName": "Haryana",
        "ThumbnailUrl": null,
        "Type": "image",
        "UpdatedAt": "2026-10-07T09:40:54.132696Z",
        "ViewsCount": 0,
        "WhatsappCount": 0
      },
      "9": {
        "CallCount": 0,
        "Caption": "",
        "CatalogUrl": "https://www.indiamart.com/rashyaafoods-faridabad/",
        "CityId": 70496,
        "CityName": "Faridabad",
        "CompanyLogo": null,
        "CompanyName": "Rashyaa Foods",
        "CountryIso": "IN",
        "CreatedAt": "2026-10-07T09:40:36.710115Z",
        "CreatedBy": -1,
        "EnquiryCount": 0,
        "FeedMediaId": 949322,
        "FeedPostId": 953465,
        "ImageGalleryId": 650876556,
        "ImageOriginalPath": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/650876556/WF/PK/UG/257306083/feedpost-jpeg.jpg",
        "ImageVariants": {
          "1000x1000": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/650876556/WF/PK/UG/257306083/feedpost-jpeg-1000x1000.jpg",
          "500x500": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/650876556/WF/PK/UG/257306083/feedpost-jpeg-500x500.jpg",
          "Original": "https://5.imimg.com/data5/ANDROID/FeedPost/2026/10/650876556/WF/PK/UG/257306083/feedpost-jpeg.jpg"
        },
        "LikeFlag": false,
        "LikesCount": 6,
        "McatId": 24076,
        "McatName": "Chili Peppers",
        "MediaTypeId": 1,
        "PostMediaType": "Image",
        "PostTypeId": 1,
        "PostTypeName": "NewOffer",
        "ProductName": "dried red whole chili peppers",
        "SellerId": 257306083,
        "SellerName": "RASHYAA FOODS",
        "SellerPnsNumber": "7942661658",
        "Source": null,
        "StateId": 6481,
        "StateName": "Haryana",
        "ThumbnailUrl": null,
        "Type": "image",
        "UpdatedAt": "2026-10-07T09:40:36.710115Z",
        "ViewsCount": 0,
        "WhatsappCount": 0
      }
    }
  }
};
