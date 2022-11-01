import { Buffer } from "https://deno.land/std@0.144.0/io/buffer.ts";

export const filterByWords = (words: Set<string>) => {
	const seg = new Intl.Segmenter(undefined, { granularity: "word" });
	return (line: string) =>
		[...seg.segment(line.toLowerCase())].filter((c) => c.isWordLike).map((
			c,
		) => c.segment)
			.filter((c) => !words.has(c)).length === 0;
}; // can be used as below, or to determine what parts of a text could be translated.

export const getWordList = (knownWords: Set<string>) => {
	const engSeg = new Intl.Segmenter(undefined, { granularity: "word" });
	const filter = filterByWords(knownWords);
	return (sentences: string[], engCol: number, otherCol: number) =>
		new Set(
			sentences.map((s) => {
				const parts = s.split("\t");
				return parts[engCol] && parts[otherCol]
					? filter(parts[otherCol])
						? [...engSeg.segment(parts[engCol].toLowerCase())]
							.filter((c) => c.isWordLike).map((c) => c.segment)
						: []
					: [];
			}).flat(),
		);
};

const buff = new Buffer();
buff.readFromSync(Deno.stdin);
const text = new TextDecoder().decode(buff.bytes());
const ws = getWordList(
	new Set(`tionghoa
orang
di
belanda
yang
kota
batavia
dan
pasukan
pada
oktober
dengan
gula
hindia
valckenier
pabrik
dalam
banyak
batas
hingga
buruh
dari
setelah
tanggal
kekerasan
tersebut
bahwa
ke
keturunan
sebuah
luar
ada
membunuh
kelompok
rumah
pemerintah
tahun
surat
mereka
terjadi
menyatakan
sebagai
juga
untuk
kecil
keresahan
terus
menyerang
etnis
lebih
tiongkok
pembunuhan
ini
sehingga
berbagai
pertempuran
oleh
jawa
pemimpin
pesisir
bertugas
kali
toko
geger
bertempur
november
antaranya
pemilik
ditakutkan
tragedi
jenderal
selamat
imigrasi
rusuh
sepanjang
berpusat
bahasa
mengumumkan
ekonomi
jam
dipicu
penguasa
memberlakukan
harus
tukang
mewajibkan
tinggal
meningkatkan
ratusan
meningkat
pulau
angke
tetap
ribuan
tambahan
ditanggapi
pertemuan
awal
dikenal
pelabuhan
pendapatan
cepat
dijadikan
mengambil
saat
dua
kerusuhan
jakarta
merupakan
berbuat
semua
pedagang
sekarang
pembantaian
berarti
masyarakat
tidak
beberapa
markas
tegas
serta
identifikasi
apapun
periode
malam
barat
penuh
berkurangnya
meriam
mengirim
tentang
dewan
chinezenmoord
meski
berlangsung
compagnie
terhadap
gubernur
badan
dapat
mempunyai
warga
voc
oostindische
pembangunan
itu
kekejaman
membakar
sementara
van
represi
jumlah
dibunuh
indië
menjelang
seluruh
kemudian
hari
besar
menyebar
raad
perdagangan
pacinan
lagi
vereenigde
laut
akibat
dihentikan
harga
minggu
mengungsi
desus
mematikan
jatuhnya
menanggapi
senjata
pogrom
pernyataan
pesat
adriaan
lain
membawa
kolonial
akhir
sedangkan
bekasi
menguatkan
dipulangkan
antara
diberlakukan
desas
mulai
sama
pengampunan
memburu
kolonialisasi`.split("\n")),
)(text.split("\n"), 0, 1);
console.log(ws);
