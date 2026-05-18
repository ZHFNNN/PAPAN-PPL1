"use client";

// app/(main)/chat/page.tsx
// Halaman daftar semua percakapan (inbox)

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

// ─── Types ────────────────────────────────────────────────────

interface UserPreview {
  id: string;
  name: string | null;
  image: string | null;
  username: string | null;
}

interface PropertyPreview {
  id: string;
  title: string;
  imageUrls: string[];
  city: string | null;
  price: number;
  listingType: string;
}

interface MessagePreview {
  id: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface ConversationItem {
  id: string;
  propertyId: string;
  userId: string;
  ownerId: string;
  updatedAt: string;
  unreadCount: number;
  property: PropertyPreview;
  user: UserPreview;
  owner: UserPreview;
  messages: MessagePreview[];
}

// ─── Helpers ─────────────────────────────────────────────────

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Kemarin";
  if (diffDays < 7) return date.toLocaleDateString("id-ID", { weekday: "short" });
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(price);
}

function getInitials(name: string | null) {
  if (!name) return "?";
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function Avatar({ src, name, size = 48 }: { src: string | null; name: string | null; size?: number }) {
  if (src) {
    return (
      <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0, position: "relative" }}>
        <Image src={src} alt={name ?? "user"} fill style={{ objectFit: "cover" }} />
      </div>
    );
  }
  return (
    <div className={styles.avatarFallback} style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {getInitials(name)}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────

export default function ChatListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Auth guard
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent("/chat")}`);
    }
  }, [status, router]);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setConversations(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchConversations();
  }, [status, fetchConversations]);

  // Poll setiap 10 detik
  useEffect(() => {
    if (status !== "authenticated") return;
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [status, fetchConversations]);

  const getPartner = (conv: ConversationItem): UserPreview => {
    if (!session?.user?.id) return conv.user;
    return conv.userId === session.user.id ? conv.owner : conv.user;
  };

  const isOwnerRole = (conv: ConversationItem) =>
    session?.user?.id === conv.ownerId;

  const filtered = conversations.filter((conv) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    const partner = getPartner(conv);
    return (
      conv.property.title.toLowerCase().includes(q) ||
      (partner.name ?? "").toLowerCase().includes(q) ||
      (conv.property.city ?? "").toLowerCase().includes(q)
    );
  });

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  if (status === "loading") {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.loadingScreen}><div className={styles.spinner} /></div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.contentArea}>
        <div className={styles.container}>

          {/* ── Header ── */}
          <div className={styles.pageHeader}>
            <div className={styles.pageHeaderLeft}>
              <h1 className={styles.pageTitle}>Pesan</h1>
              {totalUnread > 0 && (
                <span className={styles.totalUnreadBadge}>{totalUnread} belum dibaca</span>
              )}
            </div>
            <p className={styles.pageSubtitle}>
              Semua percakapan dengan pemilik & pencari properti
            </p>
          </div>

          {/* ── Search ── */}
          <div className={styles.searchWrapper}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className={styles.searchInput}
              placeholder="Cari berdasarkan nama atau properti..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* ── Content ── */}
          {loading ? (
            <div className={styles.centerState}>
              <div className={styles.spinner} />
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" width="56" height="56">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              {searchQuery ? (
                <>
                  <p className={styles.emptyTitle}>Tidak ada hasil</p>
                  <p className={styles.emptySub}>Coba kata kunci yang berbeda</p>
                </>
              ) : (
                <>
                  <p className={styles.emptyTitle}>Belum ada percakapan</p>
                  <p className={styles.emptySub}>
                    Temukan properti impianmu dan mulai chat dengan pemiliknya
                  </p>
                  <Link href="/" className={styles.browseBtn}>Telusuri Properti</Link>
                </>
              )}
            </div>
          ) : (
            <div className={styles.convList}>
              {filtered.map((conv, idx) => {
                const partner = getPartner(conv);
                const lastMsg = conv.messages[0];
                const amOwner = isOwnerRole(conv);
                const hasUnread = conv.unreadCount > 0;

                return (
                  <Link
                    key={conv.id}
                    href={`/chat/${conv.id}`}
                    className={`${styles.convCard} ${hasUnread ? styles.convCardUnread : ""}`}
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    {/* Avatar */}
                    <div className={styles.convAvatarWrap}>
                      <Avatar src={partner.image} name={partner.name} size={52} />
                      {/* Role badge */}
                      <span className={`${styles.roleBadge} ${amOwner ? styles.roleBadgeUser : styles.roleBadgeOwner}`}>
                        {amOwner ? "Pencari" : "Owner"}
                      </span>
                    </div>

                    {/* Info */}
                    <div className={styles.convInfo}>
                      <div className={styles.convTopRow}>
                        <span className={`${styles.convPartnerName} ${hasUnread ? styles.convPartnerNameBold : ""}`}>
                          {partner.name ?? partner.username ?? "Pengguna"}
                        </span>
                        {lastMsg && (
                          <span className={styles.convTime}>{formatTime(lastMsg.createdAt)}</span>
                        )}
                      </div>

                      <div className={styles.convMidRow}>
                        {/* Property pill */}
                        <span className={styles.convPropertyPill}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="10" height="10" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                          </svg>
                          {conv.property.title}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className={styles.unreadBadge}>{conv.unreadCount}</span>
                        )}
                      </div>

                      {lastMsg && (
                        <p className={`${styles.convPreview} ${hasUnread ? styles.convPreviewBold : ""}`}>
                          {lastMsg.senderId === session?.user?.id ? "Kamu: " : ""}
                          {lastMsg.content}
                        </p>
                      )}
                    </div>

                    {/* Property thumbnail */}
                    <div className={styles.convPropertyThumb}>
                      {conv.property.imageUrls?.[0] ? (
                        <Image
                          src={conv.property.imageUrls[0]}
                          alt={conv.property.title}
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <div className={styles.convPropertyThumbPlaceholder}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
                            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                      <span className={styles.convPriceTag}>{formatPrice(conv.property.price)}</span>
                    </div>

                    {/* Chevron */}
                    <svg className={styles.convChevron} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}