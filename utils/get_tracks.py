#!/usr/bin/env python3
import json
import sys
import unicodedata
import musicbrainzngs
import re
musicbrainzngs.set_useragent("One-Hit-Quiz Track Retrieval", "1.0.0", "github.com/strangebroadcasts/one-hit-quiz")


def artist_search():
    artist_name = input("Search for Artist: ")
    if len(artist_name.strip()) < 1:
        print("Exiting.")
        sys.exit(0)

    limit = 5

    result = musicbrainzngs.search_artists(artist=artist_name, limit=limit)
    print(str(len(result))+" results")
    i=1
    for artist in result['artist-list']:
        out = str(i) + ": "
        area = ""
        span = ""
        genre_list= ""
        if 'id' in artist:
            if "name" in artist:
                out += artist['name'].ljust(25) +" "
            if 'type' in artist:
                out += artist['type'].ljust(8) +" "
            if 'begin-area' in artist:
                if 'name' in artist["begin-area"]:
                    area += artist["begin-area"]["name"][:15] +" "
            if 'country' in artist:
                area += artist['country'][:20] +" "
            out += area.ljust(20) +" "
            if 'life-span' in artist:
                if 'begin' in artist["life-span"]:
                    span += "("+artist["life-span"]["begin"][:4] +" - "
                if 'ended' in artist["life-span"]:
                    if (artist["life-span"]["ended"] == "true"):
                        if 'end' in artist["life-span"]:
                            span += artist["life-span"]["end"][:4] +")"
                        else:
                            span += "?)"
                    else:
                        span += "present)"
                out += span.ljust(17) +" "
            if 'tag-list' in artist:
                genres = sorted(artist['tag-list'], key=lambda d: d['count'], reverse=True)
                if len(genres) >0:
                    genre_list += genres[0]["name"][:16] + ", "
                    if len(genres) >1:
                        genre_list += genres[1]["name"][:16] + ", "
                    out += genre_list.ljust(34)
            print(out)
        i = i+1

    try:
        artist_number = int(input('Which artist is correct? 1-'+str(limit)+': '))
        print("Chosen:", result['artist-list'][artist_number-1]["name"], result['artist-list'][artist_number-1]["id"], "\n")
    except:
        print("That's not a valid option, please type a number between 1 and "+str(limit))
        sys.exit(0)

    return result['artist-list'][artist_number-1]["id"]

def mbrainz_id():
    print("Look up the artist's MusicBrainz id")
    print("For example, you could look up the Artist Queen: ")
    print("  * via the web: https://musicbrainz.org/search?type=artist&query=queen")
    print("       where you can get the artist ID from the artist's URL")
    print("  * or via the API: https://musicbrainz.org/ws/2/artist?fmt=json&limit=5&query=Queen")
    print("       where you can get the artist ID from the artists->[result number]->id\n")

    artist_id = input("Now enter the MusicBrainz artist ID (in hex format, e.g. bcadd123-...) here: ")
    if len(artist_id.strip()) < 1:
        print("Exiting.")
        sys.exit(0)
    return artist_id

print("Would you like to:")
print("\t 1. Search for a track by artist name")
print("\t 2. Enter a MusicBrainz ID")
try:
    menu = int(input("Select Menu Option (1 or 2): "))
    if (menu == 1):
        artist_id = artist_search()
    elif (menu == 2):
        artist_id = mbrainz_id()

except:
    print("That's not a valid option, please type a number.")
    sys.exit(0)

limit = 5

if len(artist_id.strip()) < 1:
    print("Exiting, artist id error")
    sys.exit(0)
titles = []
limit, offset = 25, 0
recording_count = 10000

print("Searching")
while offset <= recording_count:
    result = musicbrainzngs.browse_recordings(artist=artist_id, limit=limit, offset=offset)
    recording_list = result.get('recording-list', [])
    recording_count = result.get('recording-count', 0)
    if offset == 0:
        print("Found ", recording_count, " recordings. Now getting them:")
    titles += [record['title'] for record in recording_list]
    offset += limit
    remaining = recording_count - offset
    print(remaining, " remaining")

titles_processed = list(
    dict.fromkeys(
        sorted({
            re.sub(r'\ ?\(.*\)$', '', unicodedata.normalize('NFC', title))
            for title in titles
        })
    )
)

checked = []
titles_deduplicated = []

for title in titles_processed:
    clean_title = re.sub(r'[^\w]', '', title.lower())
    if clean_title not in checked:
        checked.append(clean_title)
        titles_deduplicated.append(title)


print(titles_deduplicated)

questions = [title for title in titles_deduplicated]
with open('titles.json', 'w') as title_file:
    json.dump(questions, title_file, indent="")

