#!/usr/bin/env python3
import json
import sys
import unicodedata
import musicbrainzngs
import re
musicbrainzngs.set_useragent("One-Hit-Quiz Track Retrieval", "1.0.0", "github.com/strangebroadcasts/one-hit-quiz")

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
titles = []
limit, offset = 25, 0
recording_count = 10000

while offset <= recording_count:
    result = musicbrainzngs.browse_recordings(artist=artist_id, limit=limit, offset=offset)
    recording_list = result.get('recording-list', [])
    recording_count = result.get('recording-count', 0)
    if offset == 0:
        print("Found ", recording_count, " recordings")
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

