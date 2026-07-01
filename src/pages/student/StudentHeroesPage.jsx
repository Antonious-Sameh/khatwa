import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Medal, Loader2, ChevronLeft, FolderOpen, Image, Star } from 'lucide-react';
import { heroesAPI } from '@/api/services';
import api from '@/api/axios';

function AlbumView({ album, onBack }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-xl hover:bg-muted">
          <ChevronLeft className="h-4 w-4" /> رجوع للألبومات
        </button>
      </div>
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-extrabold">{album.title}</h2>
        {album.description && <p className="text-muted-foreground">{album.description}</p>}
        <p className="text-xs text-muted-foreground">{album.photos?.length || 0} صورة</p>
      </div>
      {!album.photos?.length ? (
        <div className="text-center py-20 border-2 border-dashed rounded-3xl">
          <Image className="h-12 w-12 mx-auto mb-3 opacity-20 text-muted-foreground" />
          <p className="text-muted-foreground">لا توجد صور في هذا الألبوم بعد</p>
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 gap-3 space-y-3">
          {album.photos.map(photo => (
            <div key={photo._id} className="break-inside-avoid rounded-2xl overflow-hidden border shadow-sm group relative">
              <img src={photo.url} alt={photo.caption || ''} className="w-full object-cover group-hover:scale-105 transition-transform duration-500" />
              {photo.caption && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent text-white text-xs px-3 py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {photo.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StudentHeroesPage() {
  const [albums,  setAlbums]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    heroesAPI.getAll().then(d => setAlbums(d.albums || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const openAlbum = async (album) => {
    try { const r = await api.get(`/heroes/${album._id}`); setViewing(r.data.data.album); }
    catch { setViewing(album); }
  };

  if (viewing) return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <AlbumView album={viewing} onBack={() => setViewing(null)} />
    </div>
  );

  return (
    <>
      <Helmet><title>أبطال مروا من هنا</title></Helmet>
      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-2 py-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-100 mb-2">
            <Medal className="h-8 w-8 text-yellow-600" />
          </div>
          <h2 className="text-3xl font-extrabold">أبطال مروا من هنا</h2>
          <p className="text-muted-foreground">ذكريات وإنجازات طلابنا المتميزين</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : albums.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-3xl">
            <Medal className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground font-medium">لا توجد ألبومات بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {albums.map((album, i) => (
              <button
                key={album._id}
                onClick={() => openAlbum(album)}
                className="group text-right rounded-3xl overflow-hidden border border-border/60 bg-card shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {/* Cover image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-yellow-50 to-orange-50">
                  {album.coverUrl ? (
                    <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      <FolderOpen className="h-14 w-14 text-yellow-400" />
                      <span className="text-xs text-yellow-600 font-medium">ألبوم صور</span>
                    </div>
                  )}
                  {/* Photo count badge */}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium">
                    {album.photoCount || 0} صورة
                  </div>
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Info */}
                <div className="p-4 space-y-1">
                  <div className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-base leading-tight">{album.title}</p>
                      {album.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{album.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}