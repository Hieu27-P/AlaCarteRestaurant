import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  LoaderCircle,
  Minus,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShoppingBag,
  Trash2,
  Utensils,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import vegetablePattern from '../../docs/Code/images/bgTinhMocChay.png';
import restaurantLogo from '../../docs/Code/images/lgTinhMoChay.png';
import { useCustomerMenu, type MenuItemOptionGroup } from '../hooks/useCustomerMenu';
import type { MenuItemResponseDto } from '../types/menuItem';
import type { MenuOptionResponseDto } from '../types/menuOption';
import { formatCurrencyVnd } from '../utils/formatCurrencyVnd';
import { getErrorMessage } from '../utils/getErrorMessage';

interface CartEntry {
  id: number;
  name: string;
  quantity: number;
  unitPrice: number;
  selectedOptionNames: string[];
}

function CustomerMenuPage() {
  const { categories, menuItems, isLoading, error, reload, getOptionsForMenuItem } =
    useCustomerMenu();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<MenuItemResponseDto | null>(null);
  const [itemOptionGroups, setItemOptionGroups] = useState<MenuItemOptionGroup[]>([]);
  const [selectedOptionIds, setSelectedOptionIds] = useState<Record<number, number[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [failedImageIds, setFailedImageIds] = useState<Set<number>>(() => new Set());
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const detailRequestId = useRef(0);
  const nextCartId = useRef(1);

  const activeCategories = useMemo(
    () => categories.filter((category) => category.isActive === true),
    [categories],
  );
  const activeCategoryIds = useMemo(
    () => new Set(activeCategories.map((category) => category.id)),
    [activeCategories],
  );
  const visibleItems = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('vi');
    return menuItems.filter((item) => {
      const belongsToActiveCategory =
        item.categoryId === null || activeCategoryIds.has(item.categoryId);
      const matchesCategory =
        selectedCategoryId === null || item.categoryId === selectedCategoryId;
      const matchesSearch =
        !query ||
        item.name.toLocaleLowerCase('vi').includes(query) ||
        (item.description ?? '').toLocaleLowerCase('vi').includes(query);

      return belongsToActiveCategory && matchesCategory && matchesSearch;
    });
  }, [activeCategoryIds, menuItems, searchTerm, selectedCategoryId]);
  const heroItems = useMemo(() => menuItems.slice(0, 3), [menuItems]);
  const featuredItem =
    heroItems.length > 0 ? heroItems[activeHeroIndex % heroItems.length] : undefined;
  const selectedOptions = useMemo(
    () =>
      itemOptionGroups.flatMap(({ group, options }) =>
        options
          .filter((option) => (selectedOptionIds[group.id] ?? []).includes(option.id))
          .map((option) => ({ groupName: group.name, option })),
      ),
    [itemOptionGroups, selectedOptionIds],
  );
  const detailUnitPrice =
    (selectedItem?.price ?? 0) +
    selectedOptions.reduce((sum, { option }) => sum + option.extraPrice, 0);
  const cartItemCount = cart.reduce((sum, entry) => sum + entry.quantity, 0);
  const cartSubtotal = cart.reduce(
    (sum, entry) => sum + entry.unitPrice * entry.quantity,
    0,
  );
  const hasHeroImage = Boolean(
    featuredItem?.imageUrl && !failedImageIds.has(featuredItem.id),
  );

  useEffect(() => {
    if (heroItems.length < 2) return;

    const timerId = window.setInterval(() => {
      setActiveHeroIndex((current) => (current + 1) % heroItems.length);
    }, 5000);

    return () => window.clearInterval(timerId);
  }, [heroItems.length]);

  function showHeroItem(direction: -1 | 1) {
    setActiveHeroIndex((current) =>
      (current + direction + heroItems.length) % heroItems.length,
    );
  }

  function closeDetails() {
    detailRequestId.current += 1;
    setSelectedItem(null);
    setItemOptionGroups([]);
    setSelectedOptionIds({});
    setDetailsError(null);
    setIsDetailsLoading(false);
  }

  function openDetails(item: MenuItemResponseDto) {
    if (item.isAvailable !== true) return;

    const requestId = detailRequestId.current + 1;
    detailRequestId.current = requestId;
    setSelectedItem(item);
    setItemOptionGroups([]);
    setSelectedOptionIds({});
    setQuantity(1);
    setDetailsError(null);
    setIsDetailsLoading(true);

    void getOptionsForMenuItem(item.id)
      .then((groups) => {
        if (detailRequestId.current === requestId) setItemOptionGroups(groups);
      })
      .catch((requestError: unknown) => {
        if (detailRequestId.current === requestId) {
          setDetailsError(getErrorMessage(requestError, 'Không thể tải tùy chọn món ăn.'));
        }
      })
      .finally(() => {
        if (detailRequestId.current === requestId) setIsDetailsLoading(false);
      });
  }

  function toggleOption(groupId: number, optionId: number) {
    setSelectedOptionIds((current) => {
      const selected = current[groupId] ?? [];
      const next = selected.includes(optionId)
        ? selected.filter((id) => id !== optionId)
        : [...selected, optionId];
      return { ...current, [groupId]: next };
    });
  }

  function addToCart() {
    if (!selectedItem || selectedItem.isAvailable !== true || isDetailsLoading || detailsError) {
      return;
    }

    setCart((current) => [
      ...current,
      {
        id: nextCartId.current++,
        name: selectedItem.name,
        quantity,
        unitPrice: detailUnitPrice,
        selectedOptionNames: selectedOptions.map(
          ({ groupName, option }) => `${groupName}: ${option.name}`,
        ),
      },
    ]);
    toast.success('Đã thêm món vào giỏ tạm.');
    closeDetails();
  }

  function retryDetails() {
    if (selectedItem) openDetails(selectedItem);
  }

  return (
    <div className="min-h-screen bg-tmc-cream pb-24 text-tmc-ink">
      <div className="bg-tmc-gold text-white">
        <div className="mx-auto flex h-[30px] max-w-7xl items-center justify-between px-4 text-xs sm:px-6">
          <span className="hidden sm:inline">Tịnh Mộc Chay</span>
          <a
            href="#cau-chuyen"
            className="mx-auto font-serif text-sm italic tracking-wide transition-colors hover:text-tmc-forest sm:mx-0"
          >
            Câu chuyện Tịnh Mộc Chay
          </a>
          <a
            href="#thuc-don"
            className="hidden items-center gap-1 sm:flex"
            aria-label="Đi đến thực đơn"
          >
            <Utensils size={13} aria-hidden="true" />
            Thực đơn chay
          </a>
        </div>
      </div>

      <header className="sticky top-0 z-40">
        <div className="border-b border-white/10 bg-tmc-ink">
          <div className="mx-auto grid min-h-[76px] max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 sm:px-6">
            <a href="#trang-chu" className="flex items-center" aria-label="Tịnh Mộc Chay - Trang chủ">
              <img
                src={restaurantLogo}
                alt="Tịnh Mộc Chay"
                className="h-14 w-14 object-contain sm:h-[68px] sm:w-[68px]"
              />
            </a>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                document.getElementById('thuc-don')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="mx-auto w-full max-w-xl"
              role="search"
            >
              <label className="relative block">
                <span className="sr-only">Tìm kiếm món ăn</span>
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Tìm kiếm món ăn..."
                  className="min-h-11 w-full rounded-sm border-0 bg-white py-2 pl-10 pr-3 text-sm text-tmc-ink outline-none placeholder:text-stone-400 focus:ring-2 focus:ring-tmc-gold"
                />
              </label>
            </form>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                aria-label={`Mở giỏ hàng, ${cartItemCount} món`}
                className="relative flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:text-tmc-gold-accent"
              >
                <ShoppingBag size={21} aria-hidden="true" />
                {cartItemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-tmc-gold-accent px-1 text-[10px] font-semibold text-white">
                    {cartItemCount}
                  </span>
                )}
              </button>
              <Link
                to="/admin/menu-items"
                className="hidden min-h-11 items-center gap-1 rounded-sm border border-white/20 px-3 text-xs font-medium text-white transition-colors hover:border-tmc-gold hover:text-tmc-gold sm:inline-flex"
              >
                <Settings2 size={14} aria-hidden="true" />
                Quản trị
              </Link>
            </div>
          </div>
        </div>
        <nav className="border-b border-white/10 bg-tmc-ink" aria-label="Điều hướng chính">
          <div className="mx-auto flex h-11 max-w-7xl items-center justify-center gap-1 overflow-x-auto px-3 sm:gap-6">
            <MainNavLink href="#trang-chu">Trang chủ</MainNavLink>
            <MainNavLink href="#cau-chuyen">Câu chuyện</MainNavLink>
            <MainNavLink href="#thuc-don">Thực đơn</MainNavLink>
            <Link
              to="/admin/menu-items"
              className="flex min-h-11 shrink-0 items-center px-3 text-xs font-medium uppercase tracking-wide text-tmc-gold transition-colors hover:text-white sm:hidden"
            >
              Quản trị
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section
          id="trang-chu"
          className="relative isolate flex min-h-[390px] items-center overflow-hidden bg-tmc-forest sm:min-h-[500px]"
          style={{ clipPath: 'ellipse(150% 100% at 50% 0%)' }}
          aria-label="Giới thiệu Tịnh Mộc Chay"
        >
          {hasHeroImage ? (
            <img
              key={featuredItem?.id}
              src={featuredItem?.imageUrl ?? ''}
              alt={featuredItem?.name ?? ''}
              className="absolute inset-0 -z-20 h-full w-full object-cover"
              onError={() => {
                if (featuredItem) {
                  setFailedImageIds((current) => new Set(current).add(featuredItem.id));
                }
              }}
            />
          ) : (
            <div
              className="absolute inset-0 -z-20 bg-tmc-cream bg-repeat opacity-90"
              style={{ backgroundImage: `url(${vegetablePattern})`, backgroundSize: '512px auto' }}
              aria-hidden="true"
            />
          )}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/75 via-black/55 to-black/20" />
          <div className="mx-auto w-full max-w-7xl px-6 pb-16 pt-12 text-white sm:px-10 sm:pb-24 sm:pt-20">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-tmc-gold sm:text-sm">
              Ẩm thực chay thanh tịnh
            </p>
            <h1 className="mt-3 max-w-2xl font-serif text-4xl font-semibold leading-tight sm:text-6xl">
              Tịnh Mộc Chay
              <span className="mt-1 block text-2xl font-normal italic text-tmc-gold sm:text-3xl">
                Hương vị thanh tịnh
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/85 sm:text-base">
              Một góc nhỏ yên tĩnh giữa thành phố, nơi mỗi bữa ăn là một khoảng lặng để chậm lại
              và lắng nghe cơ thể.
            </p>
            {featuredItem && (
              <p className="mt-4 text-sm text-white/90">
                {featuredItem.isAvailable === true ? 'Đang phục vụ' : 'Trong thực đơn'}:{' '}
                <span className="font-semibold">{featuredItem.name}</span>
                <span className="mx-2 text-tmc-gold">·</span>
                {formatCurrencyVnd(featuredItem.price)}
              </p>
            )}
            <a
              href="#thuc-don"
              className="mt-7 inline-flex min-h-11 items-center gap-2 border border-tmc-gold px-6 text-sm font-medium text-white transition-colors hover:bg-tmc-gold hover:text-tmc-ink"
            >
              <Utensils size={16} aria-hidden="true" />
              Khám phá thực đơn
            </a>
            {heroItems.length > 1 && (
              <div className="mt-8 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => showHeroItem(-1)}
                  aria-label="Món giới thiệu trước"
                  className="flex h-11 w-11 items-center justify-center border border-white/60 text-white transition-colors hover:bg-white hover:text-tmc-forest"
                >
                  <ChevronLeft size={19} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => showHeroItem(1)}
                  aria-label="Món giới thiệu tiếp theo"
                  className="flex h-11 w-11 items-center justify-center border border-white/60 text-white transition-colors hover:bg-white hover:text-tmc-forest"
                >
                  <ChevronRight size={19} aria-hidden="true" />
                </button>
                <span className="ml-1 text-xs tracking-widest text-white/80">
                  {activeHeroIndex + 1} / {heroItems.length}
                </span>
              </div>
            )}
          </div>
        </section>

        <section id="cau-chuyen" className="scroll-mt-32 bg-tmc-cream py-14 sm:py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-2 lg:gap-16">
            <div className="relative mx-auto w-full max-w-xl lg:mx-0">
              <div className="absolute -left-3 -top-3 h-full w-full border-2 border-tmc-olive sm:-left-5 sm:-top-5" />
              <div
                className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-white"
                style={{
                  backgroundImage: `url(${vegetablePattern})`,
                  backgroundSize: 'cover',
                }}
              >
                <img
                  src={restaurantLogo}
                  alt="Tịnh Mộc Chay"
                  className="h-40 w-40 object-contain sm:h-56 sm:w-56"
                />
              </div>
            </div>
            <div>
              <SectionLabel>Câu chuyện của chúng tôi</SectionLabel>
              <h2 className="mt-1 font-serif text-3xl font-bold text-tmc-forest sm:text-4xl">
                Một khoảng lặng giữa phố
              </h2>
              <div className="my-5 h-[3px] w-[60px] bg-tmc-olive" />
              <p className="mb-4 text-justify text-[15px] leading-8 text-tmc-body">
                Tịnh Mộc ra đời từ mong muốn mang đến một góc nhỏ yên tĩnh giữa thành phố, nơi mỗi
                bữa ăn là một khoảng lặng để chậm lại và lắng nghe cơ thể.
              </p>
              <p className="text-justify text-[15px] leading-8 text-tmc-body">
                Mỗi món chay được chế biến từ rau củ, nấm và ngũ cốc, giữ trọn vị tự nhiên, nhẹ
                nhàng, thanh đạm nhưng không kém phần tinh tế.
              </p>
              <ul className="my-7 flex flex-wrap gap-x-8 gap-y-4 text-sm text-tmc-body">
                <li>
                  <strong className="block font-serif text-2xl text-tmc-forest">100%</strong>
                  nguyên liệu thực vật
                </li>
                <li>
                  <strong className="block font-serif text-2xl text-tmc-forest">Tươi</strong>
                  chọn lựa mỗi ngày
                </li>
                <li>
                  <strong className="block font-serif text-2xl text-tmc-forest">Tịnh</strong>
                  không gian thanh tĩnh
                </li>
              </ul>
              <a
                href="#thuc-don"
                className="inline-flex min-h-11 items-center border-2 border-tmc-forest px-7 text-sm font-medium text-tmc-forest transition-colors hover:bg-tmc-forest hover:text-white"
              >
                Xem thực đơn
              </a>
            </div>
          </div>
        </section>

        <section id="thuc-don" className="scroll-mt-32 bg-white py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-8 text-center">
              <SectionLabel>Thực đơn</SectionLabel>
              <h2 className="mt-1 font-serif text-3xl font-bold text-tmc-forest sm:text-4xl">
                Hương vị thanh tịnh
              </h2>
              <div className="mx-auto mt-4 h-[3px] w-[60px] bg-tmc-olive" />
            </div>

            <nav
              className="sticky top-[127px] z-30 mb-6 border-y border-tmc-border bg-white/95 py-2 backdrop-blur"
              aria-label="Lọc món theo danh mục"
            >
              <div className="flex gap-2 overflow-x-auto">
                <CategoryTab
                  active={selectedCategoryId === null}
                  onClick={() => setSelectedCategoryId(null)}
                >
                  Tất cả món
                </CategoryTab>
                {activeCategories.map((category) => (
                  <CategoryTab
                    key={category.id}
                    active={selectedCategoryId === category.id}
                    onClick={() => setSelectedCategoryId(category.id)}
                  >
                    {category.name}
                  </CategoryTab>
                ))}
              </div>
            </nav>

            {isLoading ? (
              <div
                className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4"
                aria-label="Đang tải thực đơn"
                role="status"
              >
                {Array.from({ length: 8 }, (_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden border border-tmc-border bg-white"
                    aria-hidden="true"
                  >
                    <div className="aspect-[4/3] animate-pulse bg-stone-200" />
                    <div className="space-y-2 p-3 sm:p-4">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-stone-200" />
                      <div className="h-3 w-full animate-pulse rounded bg-stone-100" />
                      <div className="h-4 w-1/3 animate-pulse rounded bg-stone-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="border border-tmc-border bg-tmc-cream px-5 py-12 text-center">
                <p className="text-sm text-tmc-body">{error}</p>
                <button
                  type="button"
                  onClick={() => void reload()}
                  className="mt-4 inline-flex min-h-11 items-center gap-2 bg-tmc-forest px-4 text-sm font-medium text-white transition-colors hover:bg-tmc-ink"
                >
                  <RefreshCw size={16} aria-hidden="true" />
                  Thử tải lại
                </button>
              </div>
            ) : visibleItems.length === 0 ? (
              <div className="border border-tmc-border bg-tmc-cream px-5 py-14 text-center">
                <ImageOff size={30} className="mx-auto text-tmc-olive" aria-hidden="true" />
                <p className="mt-3 font-serif text-xl font-semibold text-tmc-forest">
                  {searchTerm.trim()
                    ? 'Không tìm thấy món ăn phù hợp.'
                    : selectedCategoryId !== null
                      ? 'Danh mục này hiện chưa có món ăn.'
                      : 'Thực đơn hiện chưa có món ăn.'}
                </p>
                <p className="mt-2 text-sm text-tmc-body">
                  {searchTerm.trim()
                    ? 'Thử thay đổi từ khóa tìm kiếm.'
                    : 'Vui lòng quay lại sau.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                {visibleItems.map((item) => {
                  const isAvailable = item.isAvailable === true;
                  const hasImage = Boolean(item.imageUrl) && !failedImageIds.has(item.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => openDetails(item)}
                      aria-label={`${item.name}, ${isAvailable ? 'còn phục vụ' : 'hết món'}`}
                      className="group overflow-hidden border border-tmc-border bg-white text-left transition hover:border-tmc-olive hover:shadow-[0_8px_24px_rgba(59,74,47,0.12)] disabled:cursor-not-allowed"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-tmc-cream">
                        {hasImage ? (
                          <img
                            src={item.imageUrl ?? ''}
                            alt={item.name}
                            loading="lazy"
                            className={`h-full w-full object-cover transition-transform duration-300 ${
                              isAvailable ? 'group-hover:scale-[1.04]' : 'grayscale'
                            }`}
                            onError={() =>
                              setFailedImageIds((current) => new Set(current).add(item.id))
                            }
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-tmc-olive">
                            <ImageOff size={30} aria-hidden="true" />
                          </div>
                        )}
                        <span
                          className={`absolute left-2 top-2 px-2.5 py-1 text-[11px] font-medium ${
                            isAvailable
                              ? 'bg-tmc-forest text-white'
                              : 'bg-tmc-ink/80 text-white'
                          }`}
                        >
                          {isAvailable ? 'Còn món' : 'Hết món'}
                        </span>
                      </div>
                      <div className="p-3 sm:p-4">
                        <h3 className="line-clamp-1 font-serif text-base font-semibold text-tmc-forest sm:text-lg">
                          {item.name}
                        </h3>
                        <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-tmc-body sm:text-sm">
                          {item.description || 'Chưa có mô tả cho món này.'}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-tmc-forest sm:text-base">
                          {formatCurrencyVnd(item.price)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="bg-tmc-forest pt-12 text-tmc-footer-text">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 pb-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-white">Tịnh Mộc Chay</h2>
            <p className="mt-3 max-w-sm text-sm leading-7">
              Một góc yên tĩnh giữa thành phố, nơi mỗi bữa ăn là một khoảng lặng.
            </p>
          </div>
          <div>
            <h3 className="mb-3 font-serif text-lg font-semibold text-white">Khám phá</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a className="transition-colors hover:text-white" href="#cau-chuyen">
                  Câu chuyện
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-white" href="#thuc-don">
                  Thực đơn
                </a>
              </li>
              <li>
                <Link className="transition-colors hover:text-white" to="/admin/menu-items">
                  Quản trị
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-serif text-lg font-semibold text-white">Thực đơn chay</h3>
            <p className="text-sm leading-7">
              Khám phá các món ăn và tùy chọn đang được phục vụ tại Tịnh Mộc Chay.
            </p>
          </div>
        </div>
        <div className="border-t border-white/15 py-5 text-center text-xs">
          © {new Date().getFullYear()} Tịnh Mộc Chay. All rights reserved.
        </div>
      </footer>

      {cart.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-tmc-border bg-white/95 p-3 pb-[env(safe-area-inset-bottom)] backdrop-blur">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="mx-auto flex min-h-14 w-full max-w-3xl items-center justify-between gap-3 bg-tmc-forest px-4 text-left text-white transition-colors hover:bg-tmc-ink"
          >
            <span className="flex min-w-0 items-center gap-3">
              <ShoppingBag size={20} aria-hidden="true" />
              <span className="truncate text-sm font-medium">
                Xem giỏ tạm <span className="text-white/75">· {cartItemCount} món</span>
              </span>
            </span>
            <span className="shrink-0 text-sm font-semibold">
              {formatCurrencyVnd(cartSubtotal)}
            </span>
          </button>
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="menu-item-detail-title"
            className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden border border-tmc-border bg-white"
          >
            <header className="flex items-center justify-between border-b border-tmc-border px-4 py-3">
              <h2 id="menu-item-detail-title" className="font-serif text-lg font-semibold text-tmc-forest">
                Chi tiết món ăn
              </h2>
              <button
                type="button"
                onClick={closeDetails}
                aria-label="Đóng chi tiết món"
                className="flex h-11 w-11 items-center justify-center text-tmc-body hover:bg-tmc-cream"
              >
                <X size={19} aria-hidden="true" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto">
              <div className="grid sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div className="aspect-[16/9] bg-tmc-cream sm:aspect-auto sm:min-h-64">
                  {selectedItem.imageUrl && !failedImageIds.has(selectedItem.id) ? (
                    <img
                      src={selectedItem.imageUrl}
                      alt={selectedItem.name}
                      className="h-full w-full object-cover"
                      onError={() =>
                        setFailedImageIds((current) => new Set(current).add(selectedItem.id))
                      }
                    />
                  ) : (
                    <div className="flex h-full min-h-40 items-center justify-center text-tmc-olive">
                      <ImageOff size={32} aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div className="space-y-4 p-4">
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-tmc-forest">
                      {selectedItem.name}
                    </h3>
                    {selectedItem.description && (
                      <p className="mt-1 text-sm leading-6 text-tmc-body">
                        {selectedItem.description}
                      </p>
                    )}
                    <p className="mt-2 text-base font-semibold text-tmc-forest">
                      {formatCurrencyVnd(selectedItem.price)}
                    </p>
                  </div>

                  {isDetailsLoading ? (
                    <div className="flex min-h-20 items-center gap-2 text-sm text-tmc-body" role="status">
                      <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
                      Đang tải tùy chọn...
                    </div>
                  ) : detailsError ? (
                    <div className="space-y-2" role="alert">
                      <p className="text-sm text-tmc-body">{detailsError}</p>
                      <button
                        type="button"
                        onClick={retryDetails}
                        className="inline-flex min-h-11 items-center gap-2 border border-tmc-border px-3 text-sm font-medium text-tmc-forest hover:bg-tmc-cream"
                      >
                        <RefreshCw size={16} aria-hidden="true" />
                        Thử tải lại
                      </button>
                    </div>
                  ) : itemOptionGroups.length > 0 ? (
                    <div className="space-y-4">
                      {itemOptionGroups.map(({ group, options }) => (
                        <fieldset key={group.id} className="space-y-1.5">
                          <legend className="mb-1 text-sm font-semibold text-tmc-forest">
                            {group.name}
                          </legend>
                          {options.length === 0 ? (
                            <p className="text-xs text-tmc-body">
                              Hiện chưa có lựa chọn khả dụng.
                            </p>
                          ) : (
                            options.map((option) => (
                              <OptionChoice
                                key={option.id}
                                option={option}
                                groupId={group.id}
                                checked={(selectedOptionIds[group.id] ?? []).includes(option.id)}
                                onToggle={toggleOption}
                              />
                            ))
                          )}
                        </fieldset>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-tmc-body">Món này không có tùy chọn thêm.</p>
                  )}

                  <div className="flex items-center justify-between border-t border-tmc-border pt-3">
                    <span className="text-sm font-medium text-tmc-body">Số lượng</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                        disabled={quantity <= 1}
                        aria-label="Giảm số lượng"
                        className="flex h-11 w-11 items-center justify-center border border-tmc-border text-tmc-forest disabled:opacity-40"
                      >
                        <Minus size={16} aria-hidden="true" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={quantity}
                        onChange={(event) => {
                          const nextQuantity = Number(event.target.value);
                          if (Number.isInteger(nextQuantity) && nextQuantity >= 1) {
                            setQuantity(nextQuantity);
                          }
                        }}
                        aria-label="Số lượng món"
                        className="h-11 w-14 border border-tmc-border text-center text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity((current) => current + 1)}
                        aria-label="Tăng số lượng"
                        className="flex h-11 w-11 items-center justify-center border border-tmc-border text-tmc-forest hover:bg-tmc-cream"
                      >
                        <Plus size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <footer className="flex items-center justify-between gap-3 border-t border-tmc-border bg-white p-4">
              <div>
                <p className="text-xs text-tmc-body">Tạm tính</p>
                <p className="text-base font-semibold text-tmc-forest">
                  {formatCurrencyVnd(detailUnitPrice * quantity)}
                </p>
              </div>
              <button
                type="button"
                onClick={addToCart}
                disabled={isDetailsLoading || Boolean(detailsError)}
                className="inline-flex min-h-11 items-center justify-center gap-2 bg-tmc-forest px-4 text-sm font-medium text-white transition-colors hover:bg-tmc-ink disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus size={17} aria-hidden="true" />
                Thêm vào giỏ
              </button>
            </footer>
          </section>
        </div>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            className="flex max-h-[85vh] w-full max-w-xl flex-col border border-tmc-border bg-white"
          >
            <header className="flex items-center justify-between border-b border-tmc-border px-4 py-3">
              <div>
                <h2 id="cart-title" className="font-serif text-lg font-semibold text-tmc-forest">
                  Giỏ hàng tạm
                </h2>
                <p className="mt-0.5 text-xs text-tmc-body">{cartItemCount} món</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                aria-label="Đóng giỏ hàng"
                className="flex h-11 w-11 items-center justify-center text-tmc-body hover:bg-tmc-cream"
              >
                <X size={19} aria-hidden="true" />
              </button>
            </header>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {cart.map((entry) => (
                <article
                  key={entry.id}
                  className="flex items-start justify-between gap-3 border-b border-tmc-border pb-3 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-tmc-forest">
                      {entry.quantity} × {entry.name}
                    </p>
                    {entry.selectedOptionNames.length > 0 && (
                      <ul className="mt-1 space-y-0.5 text-xs text-tmc-body">
                        {entry.selectedOptionNames.map((optionName, index) => (
                          <li key={`${entry.id}-${index}`}>{optionName}</li>
                        ))}
                      </ul>
                    )}
                    <p className="mt-1 text-sm font-medium text-tmc-forest">
                      {formatCurrencyVnd(entry.unitPrice * entry.quantity)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setCart((current) => current.filter((cartEntry) => cartEntry.id !== entry.id))
                    }
                    aria-label={`Xóa ${entry.name} khỏi giỏ tạm`}
                    className="flex h-11 w-11 shrink-0 items-center justify-center text-tmc-body hover:bg-tmc-cream hover:text-red-600"
                  >
                    <Trash2 size={17} aria-hidden="true" />
                  </button>
                </article>
              ))}
            </div>
            <footer className="border-t border-tmc-border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-tmc-body">Tạm tính</span>
                <span className="text-base font-semibold text-tmc-forest">
                  {formatCurrencyVnd(cartSubtotal)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 border border-tmc-border text-sm font-medium text-tmc-forest hover:bg-tmc-cream"
              >
                <ArrowLeft size={16} aria-hidden="true" />
                Tiếp tục xem món
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}

interface MainNavLinkProps {
  href: string;
  children: string;
}

function MainNavLink({ href, children }: MainNavLinkProps) {
  return (
    <a
      href={href}
      className="flex min-h-11 shrink-0 items-center px-3 text-xs font-medium uppercase tracking-wide text-white transition-colors hover:text-tmc-gold sm:text-sm"
    >
      {children}
    </a>
  );
}

interface SectionLabelProps {
  children: string;
}

function SectionLabel({ children }: SectionLabelProps) {
  return (
    <span className="inline-block text-xs font-medium uppercase tracking-[0.24em] text-tmc-olive sm:text-sm">
      {children}
    </span>
  );
}

interface CategoryTabProps {
  active: boolean;
  children: string;
  onClick: () => void;
}

function CategoryTab({ active, children, onClick }: CategoryTabProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`min-h-11 shrink-0 px-4 text-sm font-medium transition-colors ${
        active
          ? 'bg-tmc-forest text-white'
          : 'border border-tmc-border bg-white text-tmc-body hover:border-tmc-olive hover:text-tmc-forest'
      }`}
    >
      {children}
    </button>
  );
}

interface OptionChoiceProps {
  option: MenuOptionResponseDto;
  groupId: number;
  checked: boolean;
  onToggle: (groupId: number, optionId: number) => void;
}

function OptionChoice({ option, groupId, checked, onToggle }: OptionChoiceProps) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 border border-tmc-border px-3 text-sm text-tmc-body">
      <span className="flex min-w-0 items-center gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggle(groupId, option.id)}
          className="h-4 w-4 accent-tmc-forest"
        />
        <span className="truncate">{option.name}</span>
      </span>
      <span className="shrink-0 text-xs text-tmc-body">
        {option.extraPrice > 0 ? `+${formatCurrencyVnd(option.extraPrice)}` : 'Không phụ thu'}
      </span>
    </label>
  );
}

export default CustomerMenuPage;
