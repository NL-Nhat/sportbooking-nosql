import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { courtMockService } from '../../../mock/services/courtMockService.js';
import { formatCurrency } from '../../utils/formatters.js';
import { resolveAssetUrl } from '../../utils/fileUploadHelper.js';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { 
  Search, 
  MapPin, 
  Filter, 
  Star, 
  X, 
  Check, 
  Trophy, 
  ArrowUpDown,
  Home,
  Sun
} from 'lucide-react';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
  const [districtFilter, setDistrictFilter] = useState(searchParams.get('district') || '');
  const [indoorFilter, setIndoorFilter] = useState(searchParams.get('indoor') || '');
  const [priceRange, setPriceRange] = useState(searchParams.get('price') || '');
  const [sortBy, setSortBy] = useState('popular');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    setLoading(true);
    courtMockService.getAll({ publicOnly: true }).then((data) => {
      setCourts(data);
      setLoading(false);
    });
  }, []);

  const sports = [
    { id: '690100000000000000000001', name: 'Bóng đá' },
    { id: '690100000000000000000002', name: 'Cầu lông' },
    { id: '690100000000000000000003', name: 'Tennis' },
    { id: '690100000000000000000004', name: 'Pickleball' }
  ];

  const districts = ['Hải Châu', 'Sơn Trà', 'Ngũ Hành Sơn', 'Thanh Khê', 'Cẩm Lệ', 'Liên Chiểu'];

  // Lọc và sắp xếp kết quả
  const filteredCourts = useMemo(() => {
    let result = [...courts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        (c.facility?.name && c.facility.name.toLowerCase().includes(q)) ||
        (c.facility?.address?.detail && c.facility.address.detail.toLowerCase().includes(q))
      );
    }

    if (categoryFilter) {
      result = result.filter((c) => c.categoryId === categoryFilter);
    }

    if (districtFilter) {
      result = result.filter((c) => c.facility?.address?.district === districtFilter);
    }

    if (indoorFilter !== '') {
      const isIndoor = indoorFilter === 'true';
      result = result.filter((c) => c.attributes?.indoor === isIndoor);
    }

    if (priceRange === 'under150') {
      result = result.filter((c) => c.priceMin < 150000);
    } else if (priceRange === '150to250') {
      result = result.filter((c) => c.priceMin >= 150000 && c.priceMin <= 250000);
    } else if (priceRange === 'above250') {
      result = result.filter((c) => c.priceMin > 250000);
    }

    // Sắp xếp
    if (sortBy === 'priceAsc') {
      result.sort((a, b) => a.priceMin - b.priceMin);
    } else if (sortBy === 'priceDesc') {
      result.sort((a, b) => b.priceMin - a.priceMin);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [courts, searchQuery, categoryFilter, districtFilter, indoorFilter, priceRange, sortBy]);

  const totalPages = Math.ceil(filteredCourts.length / pageSize);
  const paginatedCourts = filteredCourts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const clearAllFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setDistrictFilter('');
    setIndoorFilter('');
    setPriceRange('');
    setSearchParams({});
    setCurrentPage(1);
  };

  return (
    <div style={{ padding: '32px 0' }}>
      <div className="container">
        {/* Top search & breadcrumb */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Tìm kiếm sân thể thao</h1>
          <p>Khám phá và đặt các sân thể thao chất lượng tại Đà Nẵng</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: '32px',
          alignItems: 'start'
        }} className="search-layout-grid">
          {/* FILTER SIDEBAR */}
          <aside className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={18} /> Bộ lọc
              </h3>
              {(categoryFilter || districtFilter || indoorFilter || priceRange || searchQuery) && (
                <button
                  onClick={clearAllFilters}
                  style={{ fontSize: '0.8rem', color: 'var(--sb-danger)', fontWeight: 600 }}
                >
                  Xóa lọc
                </button>
              )}
            </div>

            {/* Từ khóa */}
            <div className="form-group">
              <label className="form-label">Tìm tên sân hoặc cơ sở</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ví dụ: Tuyên Sơn, Sân 1..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingRight: '36px' }}
                />
                <Search size={16} style={{ position: 'absolute', right: '12px', top: '14px', color: 'var(--sb-text-muted)' }} />
              </div>
            </div>

            {/* Môn thể thao */}
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">Môn thể thao</label>
              <select
                className="form-control"
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="">Tất cả các môn</option>
                {sports.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Khu vực quận */}
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">Quận / Huyện</label>
              <select
                className="form-control"
                value={districtFilter}
                onChange={(e) => { setDistrictFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="">Toàn thành phố</option>
                {districts.map((d) => (
                  <option key={d} value={d}>Quận {d}</option>
                ))}
              </select>
            </div>

            {/* Loại sân (Trong nhà / Ngoài trời) */}
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">Không gian sân</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="indoorOpt"
                    checked={indoorFilter === ''}
                    onChange={() => { setIndoorFilter(''); setCurrentPage(1); }}
                  />
                  Tất cả
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="indoorOpt"
                    checked={indoorFilter === 'true'}
                    onChange={() => { setIndoorFilter('true'); setCurrentPage(1); }}
                  />
                  Trong nhà (Có mái che)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="indoorOpt"
                    checked={indoorFilter === 'false'}
                    onChange={() => { setIndoorFilter('false'); setCurrentPage(1); }}
                  />
                  Ngoài trời
                </label>
              </div>
            </div>

            {/* Mức giá */}
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">Mức giá tham khảo</label>
              <select
                className="form-control"
                value={priceRange}
                onChange={(e) => { setPriceRange(e.target.value); setCurrentPage(1); }}
              >
                <option value="">Tất cả mức giá</option>
                <option value="under150">Dưới 150.000 ₫/slot</option>
                <option value="150to250">150.000 ₫ - 250.000 ₫/slot</option>
                <option value="above250">Trên 250.000 ₫/slot</option>
              </select>
            </div>
          </aside>

          {/* MAIN RESULTS CONTENT */}
          <div>
            {/* Sắp xếp và đếm kết quả */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              gap: '12px'
            }}>
              <div style={{ fontSize: '0.95rem', color: 'var(--sb-text-secondary)' }}>
                Tìm thấy <strong>{filteredCourts.length}</strong> sân thể thao phù hợp
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--sb-text-muted)' }}>Sắp xếp theo:</span>
                <select
                  className="form-control"
                  style={{ height: '36px', fontSize: '0.85rem', padding: '0 10px', width: 'auto' }}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="popular">Phổ biến nhất</option>
                  <option value="rating">Đánh giá cao nhất</option>
                  <option value="priceAsc">Giá tăng dần</option>
                  <option value="priceDesc">Giá giảm dần</option>
                </select>
              </div>
            </div>

            {/* Active chips */}
            {(categoryFilter || districtFilter || indoorFilter || priceRange || searchQuery) && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                {categoryFilter && (
                  <span className="badge badge-default" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                    Môn: {sports.find(s => s.id === categoryFilter)?.name}
                    <X size={14} style={{ cursor: 'pointer', marginLeft: '4px' }} onClick={() => setCategoryFilter('')} />
                  </span>
                )}
                {districtFilter && (
                  <span className="badge badge-default" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                    Quận: {districtFilter}
                    <X size={14} style={{ cursor: 'pointer', marginLeft: '4px' }} onClick={() => setDistrictFilter('')} />
                  </span>
                )}
                {indoorFilter && (
                  <span className="badge badge-default" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                    {indoorFilter === 'true' ? 'Trong nhà' : 'Ngoài trời'}
                    <X size={14} style={{ cursor: 'pointer', marginLeft: '4px' }} onClick={() => setIndoorFilter('')} />
                  </span>
                )}
                {priceRange && (
                  <span className="badge badge-default" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                    Giá: {priceRange === 'under150' ? '< 150k' : priceRange === '150to250' ? '150k - 250k' : '> 250k'}
                    <X size={14} style={{ cursor: 'pointer', marginLeft: '4px' }} onClick={() => setPriceRange('')} />
                  </span>
                )}
              </div>
            )}

            {/* Loading / Empty / Grid */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>Đang tải danh sách sân...</div>
            ) : filteredCourts.length === 0 ? (
              <EmptyState
                title="Không tìm thấy sân phù hợp"
                description="Hãy thử bỏ bớt các tiêu chí lọc hoặc tìm kiếm theo khu vực khác."
                action={
                  <button onClick={clearAllFilters} className="btn btn-primary btn-sm">
                    Xóa toàn bộ bộ lọc
                  </button>
                }
              />
            ) : (
              <>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '24px'
                }}>
                  {paginatedCourts.map((court) => (
                    <div key={court._id} className="card card-hover" style={{ padding: 0, overflow: 'hidden' }}>
                      <div style={{ position: 'relative', width: '100%', height: '170px' }}>
                        <img
                          src={resolveAssetUrl(court.images?.[0], 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80')}
                          alt={court.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          left: '10px',
                          backgroundColor: 'rgba(23, 43, 37, 0.85)',
                          color: '#FFF',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.725rem',
                          fontWeight: 600
                        }}>
                          {court.category?.name}
                        </div>
                        {court.attributes?.indoor && (
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            backgroundColor: 'var(--sb-primary-600)',
                            color: '#FFF',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 600
                          }}>
                            Trong nhà
                          </div>
                        )}
                      </div>

                      <div style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--sb-warning)', marginBottom: '6px' }}>
                          <Star size={14} fill="currentColor" />
                          <span style={{ fontWeight: 700, color: 'var(--sb-text-primary)' }}>{court.rating}</span>
                          <span style={{ color: 'var(--sb-text-muted)' }}>({court.reviewCount})</span>
                        </div>

                        <h3 style={{ fontSize: '1rem', margin: '0 0 4px' }}>
                          <Link to={`/courts/${court._id}`} style={{ color: 'var(--sb-text-primary)' }}>
                            {court.name}
                          </Link>
                        </h3>

                        <div style={{ fontSize: '0.825rem', color: 'var(--sb-text-muted)', marginBottom: '6px' }}>
                          {court.facility?.name}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--sb-text-muted)', marginBottom: '14px' }}>
                          <MapPin size={13} /> {court.facility?.address?.district || 'Đà Nẵng'}
                        </div>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderTop: '1px solid var(--sb-border)',
                          paddingTop: '12px'
                        }}>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--sb-text-muted)' }}>Giá từ</span>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--sb-primary-700)' }}>
                              {formatCurrency(court.priceMin)}
                            </div>
                          </div>
                          <Link to={`/courts/${court._id}`} className="btn btn-primary btn-sm">
                            Xem & Đặt
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .search-layout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default SearchPage;
