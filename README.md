# Sudoku ZKP (Zero-Knowledge Proof) Uygulaması

Bu uygulama, Sudoku çözümlerini doğrulayan ve Zero-Knowledge Proof (ZKP) oluşturan bir web uygulamasıdır. Frontend Next.js ile geliştirilmiştir ve harici bir backend API'ye bağlanır.

## Proje Yapısı

- `src/`: Kaynak kodları
  - `app/`: Next.js uygulama dosyaları
  - `components/`: React bileşenleri
  - `lib/`: Yardımcı fonksiyonlar ve API servisleri

## Kurulum

### Frontend (Next.js)

1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

2. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

3. Uygulamaya tarayıcıdan erişin: `http://localhost:3000`

### Backend Yapılandırması

Frontend, harici bir backend API'ye bağlanacak şekilde yapılandırılmıştır. Backend URL'ini `.env.local` dosyasında ayarlayabilirsiniz:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Üretim ortamında, bu değeri gerçek backend URL'iniz ile değiştirin:

```
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

## Backend API Gereksinimleri

Frontend'in çalışması için backend API'nin aşağıdaki endpoint'leri sağlaması gerekir:

1. **POST /api/verify**
   - Sudoku çözümünü doğrular
   - İstek gövdesi: `{ initial_board: SudokuGrid, solution: SudokuGrid }`
   - Yanıt: `{ valid: boolean }`

2. **POST /api/prove**
   - ZKP oluşturma işlemini başlatır
   - İstek gövdesi: `{ initial_board: SudokuGrid, solution: SudokuGrid }`
   - Yanıt: `{ job_id: string }`

3. **GET /api/proof/:jobId**
   - ZKP oluşturma durumunu kontrol eder
   - Yanıt:
     ```
     {
       status: 'pending' | 'processing' | 'complete' | 'failed',
       progress: number, // 0-1 arası
       step: string,
       result?: {
         hash: string,
         proof_file: string,
         download_url: string
       },
       error?: string
     }
     ```

## Dağıtım

### Frontend Dağıtımı

1. Üretim sürümünü oluşturun:
   ```bash
   npm run build
   ```

2. Oluşturulan sürümü başlatın:
   ```bash
   npm start
   ```

### Backend Dağıtımı

Backend'i ayrı bir VPS'de çalıştırabilirsiniz. Backend'in dışarıdan erişilebilir olduğundan ve CORS ayarlarının frontend domain'inize izin verecek şekilde yapılandırıldığından emin olun.

## Notlar

- Frontend, backend'e bağlantı kuramadığında kullanıcıya uygun hata mesajları gösterecektir.
- Backend API URL'ini değiştirmek için `.env.local` dosyasını güncelleyin ve uygulamayı yeniden başlatın.
- Üretim ortamında, backend API'nizi HTTPS ile güvence altına almanız önerilir.
